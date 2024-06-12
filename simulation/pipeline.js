require('dotenv').config();
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const { spawn } = require('child_process');
const StreamPromises = require('stream/promises');
const express = require('express');
const AWS = require('aws-sdk');
const logger = require('./log');

const credentials = new AWS.SharedIniFileCredentials({
    profile: process.env.AWS_CREDENTIALS_PROFILE,
});
const sns = new AWS.SNS({ credentials, region: process.env.AWS_REGION });
const s3 = new AWS.S3({ credentials, region: process.env.AWS_REGION });

const app = express();
const port = process.env.SNS_PORT;
const acs = ['low', 'high'];
const adoptionPcts = [5, 10, 15, 20];
const rangeAnxiety = 32.93; // too academic, may be hard-coded into sim at a future date

let shouldUpdateSimulationStatus = true;

/**
 * Gets the working directory of the request with the given UUID. Will create
 * both the top-level directory `working_directory` and the UUID directory if
 * needed.
 * @param {string} uuid the unique identifier of this traffic model, from AWS
 * @returns {string} a string representing the path to the working directory of
 * the given UUID.
 */
function getWorkingDirectoryFilePath(uuid) {
    const workingDirectoryFilePath = path.join(`${__dirname}`, 'working_directory');
    if (!fs.existsSync(workingDirectoryFilePath)) {
        fs.mkdirSync(workingDirectoryFilePath);
    }
    const uuidDirectory = path.join(workingDirectoryFilePath, uuid);
    if (!fs.existsSync(uuidDirectory)) {
        fs.mkdirSync(uuidDirectory);
    }
    return uuidDirectory;
}

function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

let accessToken = null;
async function getBearerAccessToken() {
    // check cached token before requesting a new one
    if (accessToken) {
        const currentUnixTimestamp = Math.floor(new Date().getTime() / 1000);
        const parsedToken = parseJwt(accessToken);
        if (parsedToken.exp > currentUnixTimestamp) {
            logger.info('Cached token is valid; using cached token');
            return accessToken;
        }
    }
    const response = await fetch(process.env.AUTH0_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: `{"client_id":"${process.env.AUTH0_CLIENT_ID}","client_secret":"${process.env.AUTH0_CLIENT_SECRET}","audience":"${process.env.AUTH0_AUDIENCE}","grant_type":"client_credentials"}`,
    });
    if (!response.ok) {
        return Promise.reject(response);
    }
    const data = await response.json();
    accessToken = data.access_token;
    return accessToken;
}

async function updateSimulationStatus(uuid, status) {
    if (!shouldUpdateSimulationStatus) return;
    try {
        const response = await fetch(`${process.env.UPDATE_SIMULATION_STATUS_URL}?${new URLSearchParams({
            awsUuid: uuid,
        })}`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await getBearerAccessToken()}`,
            },
            body: JSON.stringify({
                status,
            }),
        });
        if (!response.ok) {
            logger.error(`[${uuid}] Failed to update simulation status: ${JSON.stringify(response)}`);
        }
        return Promise.resolve(response);
    } catch (networkError) {
        logger.error(`[${uuid}] A network error occurred when updating simulation status: ${JSON.stringify(networkError.message)}`);
        return Promise.resolve();
    }
}

/**
 * Downloads the files for this simulation from the S3 bucket specified by
 * `bucketName` under `uploadType/uuid`. Returns an object with fields for uuid,
 * uploadType, replicates, and bucketName.
 * @async
 * @param {string} uuid unique identifier for this simulation, provided by AWS
 * @param {*} uploadType type of traffic model in this upload
 * @param {*} bucketName name of S3 bucket where the data is to be downloaded
 * @returns {Promise<object>} an object with parameters necessary for running
 * the pipeline. Fields include: uuid, uploadType, replicates, bucketName.
 */
async function downloadFiles(uuid, uploadType, bucketName) {
    const vehTrajectoryObject = `${uploadType}/${uuid}/veh_trajectory`;
    const outputVehicleObject = `${uploadType}/${uuid}/output_vehicle`;
    const networkDefinitionLinksObject = `${uploadType}/${uuid}/network_definition_links`;
    const networkDefinitionNodesObject = `${uploadType}/${uuid}/network_definition_nodes`;
    const externalStationsObject = `${uploadType}/${uuid}/external_stations`;
    const uploadConfirmationObject = `${uploadType}/${uuid}/upload_confirmation`;

    const originalFilesDirectory = path.join(getWorkingDirectoryFilePath(uuid), '0_original_files');
    if (!fs.existsSync(originalFilesDirectory)) {
        fs.mkdirSync(originalFilesDirectory);
    }

    /* download files */

    // upload_confirmation, AKA the parameter file
    const uploadConfirmationFileName = 'upload_confirmation';
    logger.info(`[${uuid}] Downloading ${uploadConfirmationFileName}`);
    const uploadConfirmationParams = {
        Bucket: bucketName,
        Key: uploadConfirmationObject,
    };
    const uploadConfirmationReadStream = s3.getObject(uploadConfirmationParams).createReadStream();
    const uploadConfirmationFilePath = path.join(originalFilesDirectory, uploadConfirmationFileName);
    const uploadConfirmationWriteStream = fs.createWriteStream(uploadConfirmationFilePath);
    await StreamPromises.pipeline(uploadConfirmationReadStream, uploadConfirmationWriteStream);
    logger.info(`[${uuid}] ${uploadConfirmationFileName} downloaded`);

    const uploadConfirmationContents = fs.readFileSync(uploadConfirmationFilePath).toString();
    const parameters = JSON.parse(uploadConfirmationContents);
    const replicates = parameters.numReplicates;
    const shouldMapDemandToBlockGroups = parameters.mapDemandToBlockGroups;
    const filterExternalStations = parameters.filterExternalStations;

    // veh_trajectory
    const vehTrajectoryFileName = 'veh_trajectory.dat.zip';
    const vehTrajectoryFilePath = path.join(originalFilesDirectory, vehTrajectoryFileName);
    logger.info(`[${uuid}] Downloading ${vehTrajectoryFileName}`);
    const vehTrajectoryParams = {
        Bucket: bucketName,
        Key: vehTrajectoryObject,
    };
    const vehTrajectoryReadStream = s3.getObject(vehTrajectoryParams).createReadStream();
    const vehTrajectoryWriteStream = fs.createWriteStream(vehTrajectoryFilePath);
    await StreamPromises.pipeline(vehTrajectoryReadStream, vehTrajectoryWriteStream);
    logger.info(`[${uuid}] ${vehTrajectoryFileName} downloaded`);
    try {
        await unzipFile(uuid, vehTrajectoryFilePath, originalFilesDirectory);
    } catch (error) {
        return Promise.reject(error);
    }

    // output_vehicle
    const outputVehicleFileName = 'output_vehicle.dat.zip';
    const outputVehicleFilePath = path.join(originalFilesDirectory, outputVehicleFileName);
    logger.info(`[${uuid}] Downloading ${outputVehicleFileName}`);
    const outputVehicleParams = {
        Bucket: bucketName,
        Key: outputVehicleObject,
    };
    const outputVehicleReadStream = s3.getObject(outputVehicleParams).createReadStream();
    const outputVehicleWriteStream = fs.createWriteStream(outputVehicleFilePath);
    await StreamPromises.pipeline(outputVehicleReadStream, outputVehicleWriteStream);
    logger.info(`[${uuid}] ${outputVehicleFileName} downloaded`);
    try {
        await unzipFile(uuid, outputVehicleFilePath, originalFilesDirectory);
    } catch (error) {
        return Promise.reject(error);
    }

    // network_definition_links
    const networkDefinitionLinksFileName = 'network_definition_links.geojson.zip';
    const networkDefinitionLinksFilePath = path.join(originalFilesDirectory, networkDefinitionLinksFileName);
    logger.info(`[${uuid}] Downloading ${networkDefinitionLinksFileName}`);
    const networkDefinitionLinksParams = {
        Bucket: bucketName,
        Key: networkDefinitionLinksObject,
    };
    const networkDefinitionLinksRS = s3.getObject(networkDefinitionLinksParams).createReadStream();
    const networkDefinitionLinksWS = fs.createWriteStream(networkDefinitionLinksFilePath);
    await StreamPromises.pipeline(networkDefinitionLinksRS, networkDefinitionLinksWS);
    logger.info(`[${uuid}] ${networkDefinitionLinksFileName} downloaded`);
    try {
        await unzipFile(uuid, networkDefinitionLinksFilePath, originalFilesDirectory);
    } catch (error) {
        return Promise.reject(error);
    }

    // network_definition_nodes
    if (shouldMapDemandToBlockGroups) {
        const networkDefinitionNodesFileName = 'network_definition_nodes.geojson.zip';
        const networkDefinitionNodesFilePath = path.join(originalFilesDirectory, networkDefinitionNodesFileName);
        logger.info(`[${uuid}] Downloading ${networkDefinitionNodesFileName}`);
        const networkDefNodesParams = {
            Bucket: bucketName,
            Key: networkDefinitionNodesObject,
        };
        const networkDefinitionNodesRS = s3.getObject(networkDefNodesParams).createReadStream();
        const networkDefinitionNodesWS = fs.createWriteStream(networkDefinitionNodesFilePath);
        await StreamPromises.pipeline(networkDefinitionNodesRS, networkDefinitionNodesWS);
        logger.info(`[${uuid}] ${networkDefinitionNodesFileName} downloaded`);
        try {
            await unzipFile(uuid, networkDefinitionNodesFilePath, originalFilesDirectory);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // external stations
    if (filterExternalStations) {
        const externalStationsFileName = 'external_stations.txt';
        logger.info(`[${uuid}] Downloading ${externalStationsFileName}`);
        const externalStationsParams = {
            Bucket: bucketName,
            Key: externalStationsObject,
        };
        const externalStationsRS = s3.getObject(externalStationsParams).createReadStream();
        const externalStationsWS = fs.createWriteStream(path.join(`${getWorkingDirectoryFilePath(uuid)}`, '0_original_files', externalStationsFileName));
        await StreamPromises.pipeline(externalStationsRS, externalStationsWS);
        logger.info(`[${uuid}] ${externalStationsFileName} downloaded`);
    }

    return Promise.resolve({
        uuid,
        uploadType,
        replicates,
        bucketName,
        shouldMapDemandToBlockGroups,
        filterExternalStations
    });
}

async function unzipFile(uuid, filePath, destination) {
    return new Promise((resolve, reject) => {
        logger.info(`[${uuid}] extracting ${filePath}`);
        const process = spawn('unzip', [filePath, '-d', destination]);
        process.on('close', (exitCode) => {
            logger.info(`[${uuid}] extraction exited with code ${exitCode}`);
            if (exitCode !== 0) {
                reject(new Error(`Error extracting file ${filePath}`));
                return;
            }
            resolve(exitCode);
        });
        process.on('error', (err) => {
            logger.info(`[${uuid}] Unable to extract ${filePath}: ${err}`)
            reject(`Unable to extract ${filePath}`);
        });
    });
}

async function makeLinks(uuid) {
    const networkDefinitionFilePath = path.join(getWorkingDirectoryFilePath(uuid), '0_original_files', 'network_definition_links.geojson');
    const linksFilePath = path.join(getWorkingDirectoryFilePath(uuid), '1_make_links', 'links.csv');

    const makeLinksDirName = path.join(getWorkingDirectoryFilePath(uuid), '1_make_links');
    if (!fs.existsSync(makeLinksDirName)) {
        fs.mkdirSync(makeLinksDirName);
    }
    await updateSimulationStatus(uuid, 'Making links');
    return new Promise((resolve, reject) => {
        logger.info(`[${uuid}] Making links.csv`);
        const process = spawn('./DynusT-Parser/makeLinks.py', [networkDefinitionFilePath, linksFilePath]);
        process.on('close', (exitCode) => {
            if (exitCode !== 0) {
                reject(new Error('Making links.csv failed'));
                return;
            }
            logger.info(`[${uuid}] Making links.csv succeeded`);
            resolve(exitCode);
        });
        process.on('error', (err) => {
            reject(err);
        });
        process.stdout.on('data', (data) => {
            logger.info(`[${uuid}] stdout: ${data}`);
        });
        process.stderr.on('data', (data) => {
            logger.info(`[${uuid}] stderr: ${data}`);
        });
    });
}

async function makeTrips(uuid) {
    const linksFilePath = path.join(getWorkingDirectoryFilePath(uuid), '1_make_links', 'links.csv');
    const outputVehicleFilePath = path.join(getWorkingDirectoryFilePath(uuid), '0_original_files', 'output_vehicle.dat');
    const vehTrajectoryFilePath = path.join(getWorkingDirectoryFilePath(uuid), '0_original_files', 'VehTrajectory.dat');
    const tripsCsvFilePath = path.join(getWorkingDirectoryFilePath(uuid), '2_make_trips', 'trips.csv');

    const makeLinksDirName = path.join(getWorkingDirectoryFilePath(uuid), '2_make_trips');
    if (!fs.existsSync(makeLinksDirName)) {
        fs.mkdirSync(makeLinksDirName);
    }

    await updateSimulationStatus(uuid, 'Making trips');
    return new Promise((resolve, reject) => {
        logger.info(`[${uuid}] Making trips.csv`);
        const process = spawn('./DynusT-Parser/makeTrips.exe', [linksFilePath, outputVehicleFilePath, vehTrajectoryFilePath, tripsCsvFilePath]);
        process.stdout.on('data', (data) => {
            logger.info(`[${uuid}] ${data}`);
        });
        // makeTrips.exe outputs some status updates from stderr. This is merely
        // so a user could watch progress.
        process.stderr.on('data', (data) => {
            logger.info(`[${uuid}] ${data}`);
        });
        process.on('close', (exitCode) => {
            logger.info(`[${uuid}] Making trips.csv exited with code ${exitCode}`);
            if (exitCode !== 0) {
                reject(new Error(`Error making trips for ${uuid}`));
                return;
            }
            resolve(exitCode);
        });
        process.on('error', (err) => {
            reject(err);
        });
    });
}

async function generateEnergies(uuid, adoptionPct, ac, externalDataDirectory) {
    // temporary: only accept four specific adoption percentages
    if (![5, 10, 15, 20].includes(adoptionPct)) {
        logger.error(`[${uuid}] Invalid marketsharePct: ${adoptionPct}`);
        process.exit(1);
    }
    // constant multiplicative of energy consumption
    let consumptionFactor;
    if (ac.toUpperCase() === 'HIGH') {
        consumptionFactor = 1.2;
    } else if (ac.toUpperCase() === 'LOW') {
        consumptionFactor = 1.05;
    } else {
        logger.error(`[${uuid}] Invalid AC: '${ac}'. Must be 'high' or 'low'`);
    }

    const generateEnergiesDirName = path.join(getWorkingDirectoryFilePath(uuid), '3_generate_energies');
    if (!fs.existsSync(generateEnergiesDirName)) {
        fs.mkdirSync(generateEnergiesDirName);
    }

    const tripsCsvFilePath = path.join(getWorkingDirectoryFilePath(uuid), '2_make_trips', 'trips.csv');
    const bevFilePath = path.join(`${externalDataDirectory}/BevData/bevDescr_${adoptionPct}.csv`);
    const tripEnergiesFilePath = path.join(getWorkingDirectoryFilePath(uuid), '3_generate_energies', `trip_energies_frac${adoptionPct}_ac-${ac.toLowerCase()}.csv`);

    await updateSimulationStatus(uuid, 'Calculating energies');
    return new Promise((resolve, reject) => {
        const phaseName = 'Making trip_energies';
        logger.info(`[${uuid}] ${phaseName}`);
        const process = spawn('./Charging-Demand/generate_energies.py', [tripsCsvFilePath, bevFilePath, consumptionFactor, tripEnergiesFilePath]);
        process.stdout.on('data', (data) => {
            logger.info(`[${uuid}] ${data}`);
        });
        process.stderr.on('data', (data) => {
            logger.info(`[${uuid}] ${data}`);
        });
        process.on('close', (exitCode) => {
            logger.info(`[${uuid}] ${phaseName} exited with code ${exitCode}`);
            if (exitCode !== 0) {
                reject(new Error(`Error generating energies for ${uuid} ${adoptionPct} ${ac}`));
                return;
            }
            resolve(exitCode);
        });
        process.on('error', (err) => {
            reject(err);
        });
    });
}

async function generateAllEnergies(uuid, externalDataDirectory) {
    const energiesPromises = [];
    acs.forEach((ac) => {
        adoptionPcts.forEach((adoptionPct) => {
            energiesPromises.push(generateEnergies(uuid, adoptionPct, ac, externalDataDirectory));
        });
    });
    return Promise.all(energiesPromises);
}

async function runSimulation(uuid, replicates, adoptionPct, ac, externalDataDirectory) {
    const tripParamsFilePath = path.join(externalDataDirectory, 'nhts', 'tripParams_TX.csv'); // hardcoded TX
    const bevFilePath = path.join(externalDataDirectory, 'BevData', `bevDescr_${adoptionPct}.csv`);
    const tripsCsvFilePath = path.join(getWorkingDirectoryFilePath(uuid), '2_make_trips', 'trips.csv');
    const tripEnergiesFilePath = path.join(getWorkingDirectoryFilePath(uuid), '3_generate_energies', `trip_energies_frac${adoptionPct}_ac-${ac.toLowerCase()}.csv`);
    const externalStationsFilePath = path.join(getWorkingDirectoryFilePath(uuid), '0_original_files', 'external_stations.txt')
    const outputFilePath = path.join(getWorkingDirectoryFilePath(uuid), '4_run_simulation', `demand_rep${replicates}_ra${rangeAnxiety}_frac${adoptionPct}_ac-${ac.toLowerCase()}.csv`);

    const makeLinksDirName = path.join(getWorkingDirectoryFilePath(uuid), '4_run_simulation');
    if (!fs.existsSync(makeLinksDirName)) {
        fs.mkdirSync(makeLinksDirName);
    }

    await updateSimulationStatus(uuid, 'Running simulation');
    return new Promise((resolve, reject) => {
        const phaseName = `Running simulation with ac=${ac} and adoptionPct=${adoptionPct}`;
        logger.info(`[${uuid}] ${phaseName}`);
        const simulationCliArgs = [replicates, rangeAnxiety, tripParamsFilePath, bevFilePath, tripsCsvFilePath, tripEnergiesFilePath];
        if (fs.existsSync(externalStationsFilePath)) {
            simulationCliArgs.push(externalStationsFilePath);
        }
        simulationCliArgs.push(outputFilePath);
        console.log(simulationCliArgs);
        const process = spawn('./Charging-Demand/simulate', simulationCliArgs);
        process.on('close', (exitCode) => {
            logger.info(`[${uuid}] ${phaseName} exited with code ${exitCode}`);
            if (exitCode !== 0) {
                reject(new Error(`Error running simulation for ${uuid} ${replicates} ${adoptionPct} ${ac}`));
                return;
            }
            resolve(exitCode);
        });
        process.on('error', (err) => {
            reject(err);
        });
        process.stdout.on('data', (data) => {
            logger.info(`[${uuid}] stdout: ${data}`);
        });
        process.stderr.on('data', (data) => {
            logger.info(`[${uuid}] stderr: ${data}`);
        });
    });
}

async function runAllSimulations(uuid, replicates, externalDataDirectory) {
    // explicit for loop instead of foreach because of async/await weirdness
    // making each runSimulation call sequential rather than running all at once
    // because simulations are already parallelized and will max out system
    // resources. Makes logs clearer, too.
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < acs.length; i += 1) {
        for (let j = 0; j < adoptionPcts.length; j += 1) {
            await runSimulation(uuid, replicates, adoptionPcts[j], acs[i], externalDataDirectory);
        }
    }
    /* eslint-enable no-await-in-loop */
}

async function combineCdsResults(uuid) {
    const simulationOutputDirectory = path.join(getWorkingDirectoryFilePath(uuid), '4_run_simulation');
    const combinedResultsDirectory = path.join(getWorkingDirectoryFilePath(uuid), '5_combine_cds_results');

    const combineCdsResultsDirName = path.join(getWorkingDirectoryFilePath(uuid), '5_combine_cds_results');
    if (!fs.existsSync(combineCdsResultsDirName)) {
        fs.mkdirSync(combineCdsResultsDirName);
    }

    await updateSimulationStatus(uuid, 'Combining simulations');
    return new Promise((resolve, reject) => {
        const phaseName = 'Combining CDS results';
        logger.info(`[${uuid}] ${phaseName}`);
        const process = spawn('./Charging-Demand/Pipeline/combineCDSresults.py', [
            simulationOutputDirectory,
            combinedResultsDirectory,
        ]);
        process.on('close', (exitCode) => {
            if (exitCode !== 0) {
                reject(new Error(`Combining CDS results failed: returned exit code ${exitCode}`));
                return;
            }
            logger.info(`[${uuid}] ${phaseName} exited with code ${exitCode}`);
            resolve(exitCode);
        });
        process.on('error', (err) => {
            reject(err);
        });
        process.stdout.on('data', (data) => {
            logger.info(`[${uuid}] stdout: ${data}`);
        });
        process.stderr.on('data', (data) => {
            logger.info(`[${uuid}] stderr: ${data}`);
        });
    });
}

async function mapDemandToBlockGroups(uuid, externalDataDirectory) {
    const combinedResultsFileName = path.join(getWorkingDirectoryFilePath(uuid), '5_combine_cds_results', 'combinedDemand.csv.gz');
    const nodesFile = path.join(getWorkingDirectoryFilePath(uuid), '0_original_files', 'network_definition_nodes.geojson');
    const blockGroupsFile = path.join(externalDataDirectory, 'census', 'tl_2019_48_bg.zip'); // hardcoded for texas, for now
    const countiesFile = path.join(externalDataDirectory, 'census', 'tl_2019_us_county.zip'); // hardcoded for texas, for now

    const mapDemandToBlockGroupsDirName = path.join(getWorkingDirectoryFilePath(uuid), '6_map_demand_to_block_groups');
    if (!fs.existsSync(mapDemandToBlockGroupsDirName)) {
        fs.mkdirSync(mapDemandToBlockGroupsDirName);
    }
    const outputFilePath = path.join(getWorkingDirectoryFilePath(uuid), '6_map_demand_to_block_groups', 'block_group_demand.csv.gz');

    await updateSimulationStatus(uuid, 'Mapping demand to block groups');
    return new Promise((resolve, reject) => {
        const phaseName = 'Mapping demand to block groups';
        logger.info(`[${uuid}] ${phaseName}`);
        const process = spawn('./Charging-Demand/Pipeline/mapDemandToBlockGroups.py', [
            blockGroupsFile,
            countiesFile,
            nodesFile,
            combinedResultsFileName,
            outputFilePath,
            '--threads=32',
        ]);
        process.on('close', (exitCode) => {
            if (exitCode !== 0) {
                reject(new Error(`Mapping demand to block groups failed: returned exit code ${exitCode}`));
                return;
            }
            logger.info(`[${uuid}] ${phaseName} exited with code ${exitCode}`);
            resolve(exitCode);
        });
        process.on('error', (err) => {
            reject(err);
        });
        process.stdout.on('data', (data) => {
            logger.info(`[${uuid}] stdout: ${data}`);
        });
        process.stderr.on('data', (data) => {
            logger.info(`[${uuid}] stderr: ${data}`);
        });
    });
}

async function uploadResults(uuid, uploadType, bucketName, shouldMapDemandToBlockGroups) {
    const simulationResultsObjectKey = `${uploadType}/${uuid}/simulation_results/combinedDemand.csv.gz`;
    const combinedResultsFileName = path.join(getWorkingDirectoryFilePath(uuid), '5_combine_cds_results', 'combinedDemand.csv.gz');

    const demandMappedToBlockGroupsObjectKey = `${uploadType}/${uuid}/simulation_results/block_group_demand.csv.gz`;
    const blockGroupDemandFileName = path.join(getWorkingDirectoryFilePath(uuid), '6_map_demand_to_block_groups', 'block_group_demand.csv.gz');

    // first uploading simulation results
    logger.info(`[${uuid}] uploading simulation data`);
    const simData = await fs.promises.readFile(combinedResultsFileName);
    const simUploadParams = {
        Bucket: bucketName,
        Key: simulationResultsObjectKey,
        Body: simData,
    };
    s3.putObject(simUploadParams, (error, data) => {
        if (error) {
            throw error;
        }
        logger.info(`[${uuid}] Successfully uploaded simulation results to ${simUploadParams.Key}`);
        return data;
    });

    // uploading simulation results mapped to block group
    if (shouldMapDemandToBlockGroups) {
        logger.info(`[${uuid}] uploading block group demand data`);
        const blockGroupDemandData = await fs.promises.readFile(blockGroupDemandFileName);
        const bgDataUploadParams = {
            Bucket: bucketName,
            Key: demandMappedToBlockGroupsObjectKey,
            Body: blockGroupDemandData,
        };
        s3.putObject(bgDataUploadParams, (error, data) => {
            if (error) {
                throw error;
            }
            logger.info(`[${uuid}] Successfully uploaded block group demand data to ${bgDataUploadParams.Key}`);
            return data;
        });
    }
    await updateSimulationStatus(uuid, 'Completed');
}

function cleanup(uuid) {
    logger.info(`[${uuid}] cleaning up working directory for ${uuid}`);
    fs.rmSync(getWorkingDirectoryFilePath(uuid), { recursive: true, force: true });
}

async function startPipeline(uuid, uploadType, bucketName, externalDataDirectory) {
    try {
        const simParams = await downloadFiles(uuid, uploadType, bucketName);
        const { replicates, shouldMapDemandToBlockGroups } = simParams;
        await makeLinks(uuid);
        await makeTrips(uuid);
        await generateAllEnergies(uuid, externalDataDirectory);
        await runAllSimulations(uuid, replicates, externalDataDirectory);
        await combineCdsResults(uuid);
        if (shouldMapDemandToBlockGroups) {
            await mapDemandToBlockGroups(uuid, externalDataDirectory);
        }
        await uploadResults(uuid, uploadType, bucketName, shouldMapDemandToBlockGroups);
    } catch (error) {
        logger.info(`[${uuid}] ${error}`)
        await updateSimulationStatus(uuid, 'Errored');
    }
    cleanup(uuid);
}

/**
 * Confirms any incoming subcription confirmation.
 * Works if the user has SNS ConfirmSubscription permission.
 */
function processSubscriptionConfirmation(req) {
    const options = {
        TopicArn: req.headers['x-amz-sns-topic-arn'],
        Token: req.body.Token,
    };
    sns.confirmSubscription(options, (err, data) => {
        if (err) {
            logger.error(err);
            return;
        }
        logger.info(`Successfully confirmed subscription. Response: ${data}`);
    });
}

/**
 * Processes an SNS notification that is not a SubscriptionConfirmation.
 */
async function processNotification(req, externalDataDirectory) {
    let message;
    try {
        message = JSON.parse(req.body.Message);
    } catch (error) {
        logger.error(`Unable to parse notification: ${error}`);
        return;
    }
    const record = message.Records[0]; // assuming one record
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;
    const keyParts = objectKey.split('/');
    const uploadType = keyParts[0];
    const uuid = keyParts[1];

    startPipeline(uuid, uploadType, bucketName, externalDataDirectory);
}

/**
 * Starts listening to HTTP requests on the port declared by the top-level
 * variable `port`
 */
function startListening(externalDataDirectory) {
    app.use((req, res, next) => {
        if (req.get('x-amz-sns-message-type')) {
            req.headers['content-type'] = 'application/json';
        }
        next();
    });
    app.use(express.json());
    app.use((req, res, next) => { logger.info(`Received request with body: ${JSON.stringify(req.body)}`); next(); });
    app.post('/', (req, res) => {
        const amzSnsMessageType = req.headers['x-amz-sns-message-type'];
        if (amzSnsMessageType === 'SubscriptionConfirmation') {
            res.status(200).send('Success');
            processSubscriptionConfirmation(req);
        } else if (amzSnsMessageType === 'Notification') {
            res.status(200).send('Success');
            processNotification(req, externalDataDirectory);
        } else {
            logger.info(`Unknown amzSnsMessateType: ${amzSnsMessageType}`);
        }
    });
    app.listen(port, () => logger.info(`SNS App listening on port ${port}!`));
}

// process arguments
if (args.phase !== undefined) {
    if (args.uuid === undefined) {
        // not using logger because we are in CLI invokation here
        console.error('Error: the option --uuid=<uuid> must be provided when using --phase=<phase>');
        process.exit(1);
    }
    if (args.shouldUpdateSimulationStatus === 'false') {
        shouldUpdateSimulationStatus = false;
    }
    switch (args.phase) {
        case 'start-pipeline':
            startPipeline(args.uuid);
            break;
        case 'make-links':
            makeLinks(args.uuid);
            break;
        case 'make-trips':
            makeTrips(args.uuid);
            break;
        case 'generate-all-energies':
            if (args.externalDataDirectory === undefined) {
                console.error('Error: externalDataDirectory is a required argument');
                process.exit(1);
            }
            generateAllEnergies(args.uuid, args.externalDataDirectory);
            break;
        case 'run-all-simulations':
            if (args.externalDataDirectory === undefined) {
                console.error('Error: externalDataDirectory is a required argument');
                process.exit(1);
            }
            runAllSimulations(args.uuid, 1, args.externalDataDirectory);
            break;
        case 'combine-cds-results':
            combineCdsResults(args.uuid);
            break;
        case 'upload-results':
            uploadResults(args.uuid);
            break;
        case 'map-demand-to-block-groups':
            if (args.externalDataDirectory === undefined) {
                console.error('Error: externalDataDirectory is a required argument');
                process.exit(1);
            }
            mapDemandToBlockGroups(args.uuid, args.externalDataDirectory);
            break;
        case 'cleanup':
            cleanup(args.uuid);
            break;
        default:
            // not using logger because we are in CLI invokation here
            console.error(`Error: unknown phase option '${args.phase}'`);
            process.exit(1);
    }
} else {
    if (args.externalDataDirectory === undefined) {
        console.error('Error: externalDataDirectory is a required argument');
        process.exit(1);
    }
    startListening(args.externalDataDirectory);
}

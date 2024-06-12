-- CreateView
CREATE OR REPLACE VIEW et_prod.v_hub_timeline_linkage_scenarios AS
SELECT
  DISTINCT egs.id,
  egs.name,
  egs.description,
  egs.owner AS organization_id,
  egs.context->>'location' AS location
FROM et_prod.ev_growth_scenario egs
  JOIN et_prod.ev_growth_scenario_simulation_parameters egssp ON egs.id = egssp.ev_growth_scenario_id AND egssp.vehicle_class_id IN (3, 4)
WHERE egs.active = true;

-- CreateView
CREATE OR REPLACE VIEW et_prod.v_hub_timeline_linkage_annual_data AS
SELECT
  vegsad.id,
  vegssp.ev_growth_scenario_id,
  vvc.vehicle_class_id,
  vegsad.year,
  vegsad.ev_fraction_of_all_vehicles AS ev_penetration_rate
FROM et_prod.v_ev_growth_scenario_annual_data vegsad
  JOIN et_prod.v_ev_growth_scenario_simulation_parameters vegssp ON vegssp.id = vegsad.growth_scenario_simulation_parameters_id
  JOIN et_prod.v_vehicle_class vvc ON vvc.vehicle_class_id = vegssp.vehicle_class_id
  JOIN et_prod.v_hub_timeline_linkage_scenarios vhtls ON vhtls.id = vegssp.ev_growth_scenario_id;

-- DropView
DROP VIEW IF EXISTS et_prod.v_ev_growth_scenario_penetration_rates;

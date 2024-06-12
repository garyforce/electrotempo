const feederLineDemandService = require("../services/feeder-line-demand.service");
const feederLineDemandController = require("./feeder-line-demand.controller");

// Mock the feederLineDemand service
jest.mock("../services/feeder-line-demand.service");

describe("Feeder Line Demand Controller", () => {
  describe("get", () => {
    describe("error handling", () => {
      it("should return 400 status code if hour is less than 0", async () => {
        const req = {
          query: {
            feederLineId: 1,
            state: "NY",
            year: 2023,
            hour: -1,
          },
        };

        const res = {
          json: jest.fn(),
          status: jest.fn(() => res),
          send: jest.fn(),
        };

        const next = jest.fn();

        await feederLineDemandController.get(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("hour must be between 0 and 23");
      });

      it("should return 400 status code if hour is greater than 23", async () => {
        const req = {
          query: {
            feederLineId: 1,
            state: "NY",
            year: 2023,
            hour: 24,
          },
        };

        const res = {
          json: jest.fn(),
          status: jest.fn(() => res),
          send: jest.fn(),
        };

        const next = jest.fn();

        await feederLineDemandController.get(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("hour must be between 0 and 23");
      });
    });

    describe("calling feederLineDemand.get with the correct parameters", () => {
      it("should call feederLineDemand.get with all parameters", async () => {
        const req = {
          query: {
            feederLineId: 1,
            state: "NY",
            year: 2023,
            hour: 0,
          },
        };

        const res = {
          json: jest.fn(),
        };

        const next = jest.fn();

        await feederLineDemandController.get(req, res, next);

        expect(feederLineDemandService.get).toHaveBeenCalledWith(
          1,
          2023,
          0,
          "NY"
        );
      });

      it("should call feederLineDemand.get with feederLineId, state, and year parameters", async () => {
        const req = {
          query: {
            feederLineId: 1,
            state: "NY",
            year: 2023,
          },
        };

        const res = {
          json: jest.fn(),
        };

        const next = jest.fn();

        await feederLineDemandController.get(req, res, next);

        expect(feederLineDemandService.get).toHaveBeenCalledWith(
          1,
          2023,
          undefined,
          "NY"
        );
      });

      it("should call feederLineDemand.get with only state parameters", async () => {
        const req = {
          query: {
            state: "NY",
          },
        };

        const res = {
          json: jest.fn(),
        };

        const next = jest.fn();

        await feederLineDemandController.get(req, res, next);

        expect(feederLineDemandService.get).toHaveBeenCalledWith(
          undefined,
          undefined,
          undefined,
          "NY"
        );
      });
    });

    it("should call res.json with the state feeder line demand", async () => {
      const req = {
        query: {
          feederLineId: 1,
          state: "NY",
          year: 2023,
          hour: 10,
        },
      };

      const res = {
        json: jest.fn(),
      };

      const next = jest.fn();

      const mockStateFeederLineDemand = {
        /* mocked state feederLine demand */
      };
      feederLineDemandService.get.mockResolvedValueOnce(
        mockStateFeederLineDemand
      );

      await feederLineDemandController.get(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockStateFeederLineDemand);
    });

    it("should call next with an error if feederLineDemand.get throws an error", async () => {
      const req = {
        query: {
          feederLineId: 1,
          state: "NY",
          year: 2023,
          hour: 10,
        },
      };

      const res = {
        json: jest.fn(),
      };

      const next = jest.fn();

      const mockError = new Error("Something went wrong");
      feederLineDemandService.get.mockRejectedValueOnce(mockError);

      await feederLineDemandController.get(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});

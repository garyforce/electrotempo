const depotDemandService = require("../services/depot-demand.service");
const depotDemandController = require("./depot-demand.controller");

// Mock the depotDemand service
jest.mock("../services/depot-demand.service");

describe("Depot Demand Controller", () => {
  describe("get", () => {
    describe("error handling", () => {
      it("should return 400 status code if hour is less than 0", async () => {
        const req = {
          query: {
            depotId: 1,
            state: "NY",
            year: 2023,
            hour: -1,
            scenarioId: 1
          },
        };

        const res = {
          json: jest.fn(),
          status: jest.fn(() => res),
          send: jest.fn(),
        };

        const next = jest.fn();

        await depotDemandController.get(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("hour must be between 0 and 23");
      });

      it("should return 400 status code if hour is greater than 23", async () => {
        const req = {
          query: {
            depotId: 1,
            state: "NY",
            year: 2023,
            hour: 24,
            scenarioId: 1
          },
        };

        const res = {
          json: jest.fn(),
          status: jest.fn(() => res),
          send: jest.fn(),
        };

        const next = jest.fn();

        await depotDemandController.get(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("hour must be between 0 and 23");
      });
    });

    describe("calling depotDemand.get with the correct parameters", () => {
      it("should call depotDemand.get with all parameters", async () => {
        const req = {
          query: {
            depotId: 1,
            state: "NY",
            year: 2023,
            hour: 0,
            scenarioId: 1
          },
        };

        const res = {
          json: jest.fn(),
        };

        const next = jest.fn();

        await depotDemandController.get(req, res, next);

        expect(depotDemandService.get).toHaveBeenCalledWith(1, 2023, 0, "NY", 1);
      });

      it("should call depotDemand.get with depotId, state, and year parameters", async () => {
        const req = {
          query: {
            depotId: 1,
            state: "NY",
            year: 2023,
          },
        };

        const res = {
          json: jest.fn(),
        };

        const next = jest.fn();

        await depotDemandController.get(req, res, next);

        expect(depotDemandService.get).toHaveBeenCalledWith(
          1,
          2023,
          undefined,
          "NY",
          undefined,
        );
      });

      it("should call depotDemand.get with only state parameters", async () => {
        const req = {
          query: {
            state: "NY",
          },
        };

        const res = {
          json: jest.fn(),
        };

        const next = jest.fn();

        await depotDemandController.get(req, res, next);

        expect(depotDemandService.get).toHaveBeenCalledWith(
          undefined,
          undefined,
          undefined,
          "NY",
          undefined
        );
      });
    });

    it("should call res.json with the state depot demand", async () => {
      const req = {
        query: {
          depotId: 1,
          state: "NY",
          year: 2023,
          hour: 10,
        },
      };

      const res = {
        json: jest.fn(),
      };

      const next = jest.fn();

      const mockStateDepotDemand = {
        /* mocked state depot demand */
      };
      depotDemandService.get.mockResolvedValueOnce(mockStateDepotDemand);

      await depotDemandController.get(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockStateDepotDemand);
    });

    it("should call next with an error if depotDemand.get throws an error", async () => {
      const req = {
        query: {
          depotId: 1,
          state: "NY",
          year: 2023,
          hour: 10,
          scenarioId: 1
        },
      };

      const res = {
        json: jest.fn(),
      };

      const next = jest.fn();

      const mockError = new Error("Something went wrong");
      depotDemandService.get.mockRejectedValueOnce(mockError);

      await depotDemandController.get(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
  describe("getByState", () => {
    describe("error handling", () => {
      it("should return 400 status code if hour is less than 0", async () => {
        const req = {
          query: {
            depotId: 1,
            state: "NY",
            year: 2023,
            hour: -1,
            scenarioId: 1
          },
        };

        const res = {
          json: jest.fn(),
          status: jest.fn(() => res),
          send: jest.fn(),
        };

        const next = jest.fn();

        await depotDemandController.getByState(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("hour must be between 0 and 23");
      });

      it("should return 400 status code if hour is greater than 23", async () => {
        const req = {
          query: {
            depotId: 1,
            state: "NY",
            year: 2023,
            hour: 24,
            scenarioId: 1
          },
        };

        const res = {
          json: jest.fn(),
          status: jest.fn(() => res),
          send: jest.fn(),
        };

        const next = jest.fn();

        await depotDemandController.getByState(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("hour must be between 0 and 23");
      });
    });

    describe("calling depotDemand.getByState with the correct parameters", () => {
      it("should call depotDemand.getByState with all parameters", async () => {
        const req = {
          query: {
            depotId: 1,
            state: "NY",
            year: 2023,
            hour: 0,
            scenarioId: 1
          },
        };

        const res = {
          json: jest.fn(),
        };

        const next = jest.fn();

        await depotDemandController.getByState(req, res, next);

        expect(depotDemandService.getByState).toHaveBeenCalledWith(
          1,
          2023,
          0,
          "NY"
        );
      });

      it("should call depotDemand.getByState with depotId, state, and year parameters", async () => {
        const req = {
          query: {
            depotId: 1,
            state: "NY",
            year: 2023,
          },
        };

        const res = {
          json: jest.fn(),
        };

        const next = jest.fn();

        await depotDemandController.getByState(req, res, next);

        expect(depotDemandService.getByState).toHaveBeenCalledWith(
          1,
          2023,
          undefined,
          "NY"
        );
      });

      it("should call depotDemand.getByState with only state parameters", async () => {
        const req = {
          query: {
            state: "NY",
          },
        };

        const res = {
          json: jest.fn(),
        };

        const next = jest.fn();

        await depotDemandController.getByState(req, res, next);

        expect(depotDemandService.getByState).toHaveBeenCalledWith(
          undefined,
          undefined,
          undefined,
          "NY"
        );
      });
    });

    it("should call res.json with the state depot demand", async () => {
      const req = {
        query: {
          depotId: 1,
          state: "NY",
          year: 2023,
          hour: 10,
          scenarioId: 1
        },
      };

      const res = {
        json: jest.fn(),
      };

      const next = jest.fn();

      const mockStateDepotDemand = {
        /* mocked state depot demand */
      };
      depotDemandService.getByState.mockResolvedValueOnce(mockStateDepotDemand);

      await depotDemandController.getByState(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockStateDepotDemand);
    });

    it("should call next with an error if depotDemand.getByState throws an error", async () => {
      const req = {
        query: {
          depotId: 1,
          state: "NY",
          year: 2023,
          hour: 10,
          scenarioId: 1
        },
      };

      const res = {
        json: jest.fn(),
      };

      const next = jest.fn();

      const mockError = new Error("Something went wrong");
      depotDemandService.getByState.mockRejectedValueOnce(mockError);

      await depotDemandController.getByState(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});

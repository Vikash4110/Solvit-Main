import { Router } from "express";

import { date } from "../controllers/demo-controller.js";

const demoRouter = Router();



//secure routes
demoRouter.route("/day").post(date);


export { demoRouter };

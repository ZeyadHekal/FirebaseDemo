import { Application, Request, Response } from "express";
import { getData, signIn } from "./firebase"
import { addData, getRecentIncidents, getStations, getStatsDefaultIntervals, isValidUserUid } from "./firebaseAdmin";
import { verifyRole, verifyUser, verifyIncident } from "./middlewares";
function routes(app: Application) {
    app.get("/", async (req: Request, res: Response) => {
        if (req.body.user) {
            const { user } = req.body;
            let recentIncidents = undefined;
            if (user.accessLevel === "station") {
                recentIncidents = await getRecentIncidents([user.uid]);
            }
            res.render("dashboard", {
                user: req.body.user,
                recentIncidents,
                stations: (user.accessLevel != "station")?(await getStations(user.users)):null,
                stats: (user.accessLevel == "station")?(await getStatsDefaultIntervals(user.uid)):null,
            });
        } else {
            res.render("login");
        }
    });
    app.post("/login", async (req: Request, res: Response) => {
        const { email, password } = req.body;
        let uid = await signIn(email, password);
        if (!uid) {
            return res.status(400).send({message: "Wrong email and/or password"});
        }
        const data = await getData("users", uid);
        const session = req.session as any;
        session.user = data;
        return res.send({message: "Success", user: data});
    });
    app.get("/incident/create", verifyRole("station"), async (req: Request, res: Response) => {
        // const appConfig = await getData("appConfig", "vpnMP9UwzkL4Erqo8eqP");
        res.render("incidentReport", {
            user: req.body.user,
            incidentTypes: [
                'Dambiyada qoyska',
                'Dambiyada wadooyinka',
                'Dambiyada Hubka',
                'Dambiyada Caruurta',
                'Dhac hanti',
                'Musuqmaasuq',
                'Daroogo',
                'Rabshad kicin',
                'Dhac internetka',
                'Dambiyo Kale'
            ],
            // incidentTypes: appConfig.incidentTypes
        });
    });
    app.get("/incident/stats/:id", verifyUser, async (req: Request, res: Response) => {
        const { user } = req.body;
        if (user.accessLevel == "station") {
            req.params.id = user.uid;
        }
        if (!await isValidUserUid(req.params.id)) return res.status(400).send({message: "user doesn't exist!"})
        if (req.params.id) {
            res.status(200).send({message: "success", stats: await getStatsDefaultIntervals(req.params.id)});
        } else {
            res.status(400).send({message: "no station selected"});
        }
    });
    app.post("/incident/create", verifyRole("station"), async (req: Request, res: Response) => {
        const { user } = req.body;
        delete req.body.user;
        const timestamp = new Date().getTime();
        if (req.body.incidentNumber == '')
            req.body.incidentNumber = timestamp;
        req.body.createdAt = timestamp;
        req.body.creatorUid = user.uid;
        const success = await addData("incident", req.body);
        if (success)
            res.redirect("/");
        else
            res.status(400).send({message: "Something's wrong in your request!"});
    });
    app.get("/incident/:id", verifyIncident, async (req: Request, res: Response) => {
        res.render("incidentReport", {
            user: req.body.user,
            incident: req.body.incident
        });
    });
    app.get("/signout",async (req: Request, res: Response) => {
        req.session.destroy((err) => {
            if (err) console.log("Error destroying session", err)
            res.redirect("/");
        });
    });
}

export default routes;
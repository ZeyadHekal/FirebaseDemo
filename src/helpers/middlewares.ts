import { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "./config";
import { getData } from "./firebase";

export function sessionUserToBody(req: Request, res: Response, next: NextFunction) {
    const session = req.session as any;
    if (session.user) {
        req.body.user = session.user;
    } else {
        delete req.body.user;
    }
    next();
}

export function verifyUser(req: Request, res: Response, next: NextFunction) {
    const { user } = req.body;
    if (!user) {
        return res.status(401).send({message: "You are not logged in!"});
    }
    next();
}

export function verifyRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { user } = req.body;
        if (user?.accessLevel === role) {
            return next();
        }
        res.redirect("/");
    }
}

export async function verifyIncident(req: Request, res: Response, next: NextFunction) {
    const { user } = req.body;
    if (!user) {
        return res.redirect("/");
    }
    const incident = await getData("incident", req.params.id);
    if (incident === undefined) {
        return res.status(404).render("404");
    }
    if (user.accessLevel === "station" && incident.creatorUid !== user.uid) {
        return res.redirect("/");
    }
    if (user.accessLevel === "branch" && user.users.includes(incident.creatorUid) === false) {
        return res.redirect("/");
    }
    req.body.incident = incident;
    next();
}
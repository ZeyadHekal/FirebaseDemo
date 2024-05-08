import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./helpers/router";
import path from "path";
import session from "express-session";
import { SESSION_SECRET, SESSION_AGE_IN_MINUTES, EXPRESS_SERVER_PORT } from "./helpers/config";
import { sessionUserToBody } from "./helpers/middlewares"

async function startServer() : Promise<void> {
    const app : Express = express();
    // Midlewares
    app.use(session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, maxAge: SESSION_AGE_IN_MINUTES*60*1000 }
    }))
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '/views'));
    app.use(express.json({limit: "50mb"}));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(sessionUserToBody);
    // app.use(express.urlencoded({ limit:"50mb", extended: true}));
    app.use(cors());
    routes(app);
    app.use(express.static(path.join(__dirname, 'public')))
    app.use((req, res) => {
        return res.status(404).render("404");
    })
    // Start server
    app.listen(EXPRESS_SERVER_PORT, () => {
        console.log(`Server is running on port ${EXPRESS_SERVER_PORT}`);
    });
    
}


startServer().catch((error) => {
    console.error('Failed to start the server.', error);
});
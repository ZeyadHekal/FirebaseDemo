import path from "path";
import admin from "firebase-admin";
import { getFirestore, DocumentData, Timestamp } from "firebase-admin/firestore";

const serviceAccount = require(path.join(__dirname, "../../", ".firebaseAdmin"));
const app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = getFirestore(app);

export async function addData(collection: string, data: any) {
    try {
        const res = await db.collection(collection).add(data);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

export async function isValidUserUid(uid: string) {
    const usersRef = await db.collection("users").doc(uid).get();
    return usersRef.exists;
}

export async function getRecentIncidents(uids: string[], number: number = 10) {
    const collectionRef = db.collection("incident");
    const results = await collectionRef.where("creatorUid", "in", uids).orderBy('createdAt', 'desc').limit(number).get();
    const toReturn: any = [];
    results.docs.forEach(d => {
        const obj = d.data();
        const newObj = {
            uid: d.id,
            createdAt: obj.createdAt,
            reportingName: obj.reportingName,
            officerName: obj.officerName
        }
        toReturn.push(newObj);
    });
    return toReturn;
}


export async function getStatsForInterval(uid: string, start?: number, end?: number) {
    const collectionRef = db.collection("incident");
    let results;
    if (start && end) {
        results = await collectionRef.where("creatorUid", "==", uid)
        .where("createdAt", ">=", start).where("createdAt", "<=", end).count().get();
    } else if (start) {
        results = await collectionRef.where("creatorUid", "==", uid)
        .where("createdAt", ">=", start).count().get();
    } else {
        results = await collectionRef.where("creatorUid", "==", uid)
        .where("createdAt", ">=", start).where("createdAt", "<=", end).count().get();
    }
    return results.data().count;
}

export async function getStatsDefaultIntervals(uid: string) {
    const day = await getStatsForInterval(uid, new Date().getTime()-1000*60*60*24);
    const week = await getStatsForInterval(uid, new Date().getTime()-1000*60*60*24*7);
    const month = await getStatsForInterval(uid, new Date().getTime()-1000*60*60*24*30);
    return { day, week, month };
}

export async function getStations(uids?: string[]) {
    if (!uids) {
        const usersRef = await db.collection("users").where("accessLevel", "==", "station").get();
        return usersRef.docs;
    }
    const docs = [];
    for (const uid of uids) {
        const usersRef = await db.collection("users").doc(uid).get();
        docs.push(usersRef);
    }
    return docs;
}
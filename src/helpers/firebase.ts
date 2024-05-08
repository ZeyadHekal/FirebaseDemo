import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, Auth } from "firebase/auth";
import { getFirestore, doc, getDoc, DocumentData} from "firebase/firestore";
// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = require(path.join(__dirname, "../../", ".firebaseClient"));;


const app = initializeApp(firebaseConfig);
const dbClient = getFirestore(app);

export async function signIn(username: string, password: string) {
    const auth = getAuth(app);
    let uid = null;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        uid = userCredential.user.uid;
    } catch(e) {}
    return uid;
}

export async function getData(collection: string, uid: string) {
    try {
        const docRef = doc(dbClient, collection, uid);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();
        if (docSnap.exists() && data)
            data.uid = docSnap.id;
        return data;
    } catch(e) {
        return undefined;
    }
}

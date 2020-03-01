// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const config = require("../config/firebase.json");

// Initialize Firebase
firebase.initializeApp(config);

export const firestore = firebase.firestore();

// export async function initAuthObserver(context: any) {
//   firebase.auth().onAuthStateChanged(async (user) => {
//     if (user) {
//       if (!context.$store.state.isLoggedIn) {
//         try {
//           const token = await user.getIdToken(/* forceRefresh */ true);

//           if (!token) {
//             throw new Error('Not Allowed');
//           }

//           const count = await getUsersCount(token);

//           if (count === 0) {
//             await grantAdminAccess(user.email, token);
//           }

//           const result = await user.getIdTokenResult(true);

//           if (result && result.claims && result.claims.admin) {
//             context.$store.dispatch('setAuth', { isLoggedIn: true, error: null, isLoading: false });
//             context.$router.push('/');
//           } else {
//             throw new Error('Nice Try!');
//           }
//         } catch (error) {
//           // Error
//           let errMsg = error.message;

//           if (error.response && error.response.data) {
//             errMsg = error.response.data;
//           }

//           context.$store.dispatch('setAuth', { isLoggedIn: false, error: errMsg, isLoading: false });
//         }
//       }
//     } else {
//       context.$store.dispatch('setAuth', { isLoggedIn: false, error: null, isLoading: false });
//     }

//     const requireAuth = context.$route.matched.some((record: any) => record.meta.requireAuth);

//     if (requireAuth && !user) {
//       context.$router.push('/login');
//     }
//   });
// }

export async function logoutFirebaseUser() {
  await firebase.auth().signOut();
  sessionStorage.removeItem('store');
}

// window.onunload = () => {
//   logoutFirebaseUser();
// };

export function firebaseLogin(context: any) {
  const provider = new firebase.auth.GoogleAuthProvider();
  context.$store.dispatch('setAuth', { isLoggedIn: false, error: null, isLoading: true });
  firebase.auth().signInWithRedirect(provider);
}

export async function getToken(force: boolean = false) {
  const user = firebase.auth().currentUser;

  if (!user) {
    return null;
  }

  return await user.getIdToken(force);
}

/* * * * * * * * * * * * * * * * *
 *    CMST 495 6380 Group 2      *
 * * * * * * * * * * * * * * * * *
 *
 * Name: Database.js
 * Author: Rachael Schutzman, Selamawit Asfaw, Danny Ramirez, Gilda Hogan, Gavin Spain
 * Description: Holds the Database class.
 *
 */

/* Revision History
 * 11/30/2019 - Initially created.
 * (Rachael Schutzman)
 * 
 * 12/04/2019 - Created MongoDB. Created findHighScore() and findInitials() functions. (Update: No longer using 
 *              MongoDB. Functions obsolete)
 * (Rachael Schutzman)
 *
 * 12/07/2019 - Created the database connnection using Firebase, and the
 * gotData(), errorData() funcitons.
 * (Danny Ramirez)
 * 
 * 12/11/2019 - Created initial insertData() function.
 * (Rachael Schutzman)
 * 
 * 12/13/2019 - Updated insertData() to include user parameters and set the 
 *              database collection
 *            - Updated database variables to better reflect the project design
 * (Danny Ramirez)
 * 
 * 12/14/2019 - Created getHighScore() to retrive the highest score from the Database
 * (Gavin Spain)
 *
 * 12/15/2019 - Updated getHighScore() to fix the issue of not being able to 
 *              read the top score from the database. Also set the highScore
 *              value to that of the top score found in the database.
 * (Danny Ramirez)
 */

class Database {

    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyBeVeyNVkJKXmeAFjMjOdejvHbmgEc2iic",
            authDomain: "cmsc-495-snake-game.firebaseapp.com",
            databaseURL: "https://cmsc-495-snake-game.firebaseio.com",
            projectId: "cmsc-495-snake-game",
            storageBucket: "cmsc-495-snake-game.appspot.com",
            messagingSenderId: "51076916688",
            appId: "1:51076916688:web:9782eedd2baf1292af45d5",
            measurementId: "G-785YJP9Y4M"
        };

        // Initialize Firebase
        firebase.initializeApp(this.firebaseConfig);
        firebase.analytics();

        this.collectionName = "Scores";
        this.db = firebase.database();
        this.ref = this.db.ref(this.collectionName);

        if (debugOn) {
            console.log("Connected to the database!");
        }
    }

    /**
     * The following function is taken from a Coding Train tutorial
     * @see https://shiffman.net/a2z/firebase/
     */
    gotData(data) {
        let scoreItems = selectAll(".score-item");

        for (let i = 0; i < scoreItems.length; i++) {
            scoreItems[i].remove();
        }

        let scores = data.val();
        let keys = Object.keys(scores);
        keys.reverse();

        // Iterate through all the keys and get their values
        console.log("====== High Scores =======");
        for (let i = 0; i < keys.length; i++) {
            let k = keys[i];
            let initials = scores[k].player_intl;
            let score = scores[k].player_score;

            let li = createElement("li", `${initials}  ${score}`);
            li.class("score-item");
            li.parent("score-list");
            console.log(initials, score);
        }
        console.log("==========================");

    }

    /**
     * The following function is taken from a Coding Train tutorial
     * @see https://shiffman.net/a2z/firebase/
     */
    errorData(error){
        console.log("There was an error retreiving the database data!");
        console.log(error);
    }

    insertData(initials, score) {
        const player_id = this.ref.push().key;
        let playerInfo = {
             player_intl: initials,
             player_score: score
        };
        // this.ref.push(playerInfo);
        this.ref.child(player_id).update(playerInfo);
   }

   getHighScore() {

       this.ref.orderByChild("player_score").limitToLast(1).once("value", snapshot =>  {
           let scores = snapshot.val();

           let topPlayer = Object.values(scores);

           let topPlayerInitials = topPlayer[0].player_intl;

           let topScore = topPlayer[0].player_score;

           highScore = topScore;

           if (debugOn) {
               console.log("Top Player:", topPlayerInitials);
               console.log("Top Score:", topScore);
           }
        });

    }
}
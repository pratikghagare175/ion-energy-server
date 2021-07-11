### Installation Guide
1. Clone this repo
2. Run Command npm i
3. Create a .env file and add local mongo connection uri as MONGODB_URL=mongodb://127.0.0.1:27017/ion-energy-db
4. Create a folder with the name "uploads" in the root of the project.
5. Start the server using "node --max-old-space-size=4096 app.js"
6. The JSON file is uploaded in the uploads folder.(NOTE: Do Not Delete this file)
7. A default data is added in DB when the execution starts.
8. The file operation takes approximately 16 mins.(Check terminal for execution)
9. When the operation is completed a message "All Done" appears
10. The JSON file stored in the uploads folder will be deleted automatically
   when the process ends.
11. After that check your DB the values will be updated.
12. At the end just refresh the page in Frontend to display the data.
13. To retest the process just delete the DB entry and start the process again.

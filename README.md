### Installation Guide
1. Clone this repo
2. Run Command npm i
3. Create a .env file and add local mongo connection uri as
   MONGODB_URL="YOUR URL"
4. Start the server using "node --max-old-space-size=4096 app.js"
5. The JSON file is uploaded in the uploads folder.(NOTE: Do Not Delete this file)
6. A default data is added in DB when the execution starts.
7. The file operation takes approximately 16 mins.(Check terminal for execution)
8. When the operation is completed a message "All Done" appears
9. The JSON file stored in the uploads folder will be deleted automatically
   when the process ends.
10. After that check your DB the values will be updated.
11. At the end just refresh the page in Frontend to display the data.
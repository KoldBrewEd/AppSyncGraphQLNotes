
# AWS Amplify Multiuser GraphQL CRUD(L) App using the Amplify DataStore 

Details and instructions on: https://medium.com/open-graphql/create-a-multiuser-graphql-crud-l-app-in-5-minutes-with-the-amplify-datastore-902764f27404

Previous version (without DataStore): https://medium.com/open-graphql/create-a-multiuser-graphql-crud-l-app-in-10-minutes-with-the-new-aws-amplify-cli-and-in-a-few-73aef3d49545

![Amplify DataStore](media/DataStore.gif)

## One-Click Deploy with the Amplify Console

Click the button to load the AWS Amplify Console, connect to GitHub and provide an IAM role for the build:

<p align="center">
    <a href="https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/awsed/AppSyncGraphQLNotes" target="_blank">
        <img src="https://oneclick.amplifyapp.com/button.svg" alt="Deploy to Amplify Console">
    </a>
</p>

## Manual Setup

### Pre-Requisites

- [NodeJS](https://nodejs.org/en/download/) with [NPM](https://docs.npmjs.com/getting-started/installing-node)
- [AWS Amplify CLI](https://github.com/aws-amplify/amplify-cli) configured for a region where [AWS AppSync](https://docs.aws.amazon.com/general/latest/gr/rande.html) and all other services in use are available `(npm install -g @aws-amplify/cli)`

### Instructions

1. Clone the repository
2. Install the required modules:

    ```bash
    npm install 
    ```

3. Init the directory as an amplify Javascript project using the React framework:

   ```bash
   amplify init
   ```

4. Now it's time to provision your cloud resources based on the local setup and configured features, execute the following command accepting all default options:

   ```bash
   amplify push
   ```

   Wait for the provisioning to complete. Once done, a `src/aws-exports.js` file with the resources information is created.

5. Finally, execute the following command to install your project package dependencies and run the application locally:

   ```bash
   amplify serve
   ```

6. Open different browsers and test connections signing in/up with multiple users. Alternativelly publish your application and use the public link:

    ```bash
    amplify add hosting
    amplify publish
    ```

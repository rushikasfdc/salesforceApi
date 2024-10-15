const vscode = require('vscode');
const { exec } = require('child_process');
const jsforce = require('jsforce');

// Function to fetch authentication info from SFDX
function getSfdxAuthInfo() {
    return new Promise((resolve, reject) => {
        exec('sfdx force:org:display --json', (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing sfdx command: ${stderr}`);
                return;
            }
            const authInfo = JSON.parse(stdout).result;
            resolve(authInfo);
        });
    });
}

// Function to connect with Salesforce using SFDX tokens
async function connectWithSfdx() {
    try {
        const authInfo = await getSfdxAuthInfo();

        // Initialize JSForce connection with the access token and instance URL
        const conn = new jsforce.Connection({
            instanceUrl: authInfo.instanceUrl,
            accessToken: authInfo.accessToken
        });

        // Fetch all Salesforce objects
        const metadata = await conn.describeGlobal();
        const objects = metadata.sobjects;

        // Ask the user to select multiple Salesforce objects (up to 3)
        const selectedObjects = await vscode.window.showQuickPick(objects.map(o => o.name), {
            canPickMany: true,
            placeHolder: 'Select up to 3 Salesforce Objects',
        });

        if (selectedObjects && selectedObjects.length > 0 && selectedObjects.length <= 3) {
            let allFields = [];
            for (const obj of selectedObjects) {
                const objectDetails = await conn.describe(obj);
                allFields.push({ objectName: obj, fields: objectDetails.fields });
            }
            return allFields;
        } else {
            vscode.window.showErrorMessage('Please select between 1 and 3 objects.');
            return [];
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to authenticate with SFDX: ${error}`);
        return [];
    }
}

// Function to show the fields in separate tables
function showFieldsTables(objectsWithFields) {
    const panel = vscode.window.createWebviewPanel(
        'salesforceFields',
        'Salesforce Object Fields',
        vscode.ViewColumn.One,
        {}
    );

    let content = '<html><body><h1>Salesforce Object Fields</h1>';

    objectsWithFields.forEach((objectData) => {
        let tableContent = `
            <h2>${objectData.objectName}</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <th style="border: 1px solid black; padding: 8px;">Field Label</th>
                    <th style="border: 1px solid black; padding: 8px;">API Name</th>
                </tr>`;
        objectData.fields.forEach(field => {
            tableContent += `<tr>
                <td style="border: 1px solid black; padding: 8px;">${field.label}</td>
                <td style="border: 1px solid black; padding: 8px;">${field.name}</td>
            </tr>`;
        });
        tableContent += '</table><br>';
        content += tableContent;
    });

    content += '</body></html>';

    panel.webview.html = content;
}

// This method is called when your extension is activated
function activate(context) {
    const disposable = vscode.commands.registerCommand('extension.selectSalesforceObject', async function () {
        const objectsWithFields = await connectWithSfdx();
        if (objectsWithFields.length > 0) {
            showFieldsTables(objectsWithFields);
        }
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};

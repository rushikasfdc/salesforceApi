# ![Salesforce API Explorer Logo](assets/icon.png) Salesforce API Explorer

A powerful Visual Studio Code extension that allows you to explore Salesforce objects and fields through the API directly within your editor. Fetch and display metadata for up to three objects at once, showing field labels and API names in an easy-to-read format.

## Features

- **Salesforce Object Explorer**: Select Salesforce objects and view their fields, including labels and API names.
- **Multi-Object Support**: Select up to three Salesforce objects at once and view their fields in separate tables.
- **SFDX Integration**: Automatically authenticate using SFDX logs, no additional login required.
- **Simple UI**: View object metadata in a clean, readable table format directly within Visual Studio Code.
  


## Installation

1. Install Salesforce CLI (SFDX) and authenticate with your org:

   ```bash
   sfdx auth:web:login

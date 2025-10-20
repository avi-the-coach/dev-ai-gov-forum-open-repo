# Google Sheets MCP Server Setup Guide

## What This Does
Gives Claude Code direct access to read/write your Google Sheets - no more manual copy-paste!

## Two Options

### Option 1: mcp-google-sheets-server (Recommended - Most Features)
- 40+ tools for complete sheet management
- Charts, formatting, advanced operations
- More setup required

### Option 2: mcp-gsheets (Simpler)
- Basic read/write operations
- Faster to set up
- Good enough for this project

**Let's go with Option 2 (mcp-gsheets) for now - simpler and sufficient.**

---

## Setup Steps for mcp-gsheets

### Step 1: Google Cloud Setup (5 minutes)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project**:
   - Click "Select a project" → "New Project"
   - Name it: "Claude MCP Sheets"
   - Click "Create"

3. **Enable Google Sheets API**:
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Google Sheets API"
   - Click it → Click "Enable"

4. **Create Service Account**:
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Click "Create Service Account"
   - Name: "claude-sheets-access"
   - Click "Create and Continue"
   - Skip roles (click Continue)
   - Click "Done"

5. **Create Service Account Key**:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON"
   - Click "Create"
   - **Save this JSON file** - you'll need it!

6. **Share your Google Sheet with the Service Account**:
   - Open the JSON file you downloaded
   - Find the `client_email` field (looks like: `claude-sheets-access@...iam.gserviceaccount.com`)
   - Copy that email
   - Go to your Google Sheet
   - Click "Share"
   - Paste the service account email
   - Give it "Editor" access
   - Click "Send"

### Step 2: Install MCP Server

Open a terminal and run:

```bash
npm install -g mcp-gsheets
```

### Step 3: Configure Claude Code

1. **Open Claude Code MCP settings**:
   - Run: `claude mcp edit`
   - Or manually edit: `~/.claude/mcp_settings.json` (Mac/Linux) or `C:\Users\[YourUser]\.claude\mcp_settings.json` (Windows)

2. **Add this configuration**:

```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "mcp-gsheets",
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "PATH_TO_YOUR_SERVICE_ACCOUNT_JSON_FILE"
      }
    }
  }
}
```

**Replace `PATH_TO_YOUR_SERVICE_ACCOUNT_JSON_FILE`** with the full path to the JSON file you downloaded.

Example:
- Windows: `"C:\\Users\\aviba\\Documents\\claude-sheets-key.json"`
- Mac/Linux: `"/Users/aviba/Documents/claude-sheets-key.json"`

3. **Save and restart Claude Code**

### Step 4: Test It

After restart, I should be able to:
- Read your sheet
- Write to your sheet
- Set up headers automatically

---

## Security Notes

✅ **Secure**: The service account JSON file stays on your local machine
✅ **Private**: Only the service account email has access to your sheet
✅ **Revokable**: You can remove the service account's access anytime from the sheet's sharing settings

---

## What to Do Now

1. Follow Steps 1-3 above
2. Let me know when you're done
3. I'll test access to your sheet
4. Then we'll complete the webinar registration setup!

---

## Troubleshooting

**If it doesn't work:**
- Make sure the service account email is shared with the sheet (with Editor access)
- Check the path to the JSON file is correct (use full path, not relative)
- Restart Claude Code after adding the configuration
- Check for typos in the JSON configuration

**Need help?** Just let me know which step you're stuck on!

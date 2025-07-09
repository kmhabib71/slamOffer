# **📋 N8N Workflow Setup Guide**

## **🎯 Phase 1: Basic Warm Outreach Workflow**

### **Step 1: Create the Workflow**

1. **Open n8n** at `http://localhost:5678`
2. **Click "New workflow"**
3. **Name it**: "Warm Outreach Campaign"

### **Step 2: Add Webhook Trigger**

1. **Click the "+" button** to add a node
2. **Search for "Webhook"** and select it
3. **Configure the webhook:**
   - **HTTP Method**: `POST`
   - **Path**: `warm-outreach`
   - **Response Mode**: `Response Code`
   - **Response Code**: `200`
   - **Response Headers**: `Content-Type: application/json`

### **Step 3: Add Set Node (Data Processing)**

1. **Click "+" after webhook node**
2. **Search "Set"** and select it
3. **Configure it:**
   - **Keep Only Set**: `false`
   - **Add these values:**
     ```
     userId = {{ $json.userId }}
     contacts = {{ $json.contacts }}
     message_template = {{ $json.message_template || "Hi {{name}}, I wanted to reach out..." }}
     executionId = {{ $runIndex }}
     timestamp = {{ $now }}
     ```

### **Step 4: Add Split In Batches Node**

1. **Click "+" after Set node**
2. **Search "Split In Batches"** and select it
3. **Configure:**
   - **Batch Size**: `5`
   - **Input Data**: `contacts`

### **Step 5: Add Function Node (Email Processing)**

1. **Click "+" after Split In Batches**
2. **Search "Function"** and select it
3. **Add this JavaScript code:**

```javascript
// Process each contact in the batch
const contacts = $node['Split In Batches'].json.contacts
const messageTemplate = $node['Set'].json.message_template
const results = []

for (const contact of contacts) {
  // Personalize the message
  let personalizedMessage = messageTemplate
    .replace(/{{name}}/g, contact.name || 'there')
    .replace(/{{company}}/g, contact.company || 'your company')

  // Log the contact processing
  console.log(`Processing contact: ${contact.email}`)

  // Add to results
  results.push({
    email: contact.email,
    name: contact.name,
    company: contact.company,
    message: personalizedMessage,
    processed_at: new Date().toISOString(),
    status: 'processed',
  })
}

return results.map(result => ({ json: result }))
```

### **Step 6: Add HTTP Request Node (Response)**

1. **Click "+" after Function node**
2. **Search "HTTP Request"** and select it
3. **Configure:**
   - **Method**: `POST`
   - **URL**: `http://localhost:3000/api/n8n-workflows/webhook`
   - **Body Content Type**: `JSON`
   - **Body (JSON):**
   ```json
   {
     "workflowType": "warm-outreach",
     "userId": "{{ $node['Set'].json['userId'] }}",
     "executionId": "{{ $node['Set'].json['executionId'] }}",
     "status": "completed",
     "data": {
       "contacts": "{{ $node['Split In Batches'].json['contacts'] }}",
       "processed_contacts": "{{ $json }}",
       "processed_at": "{{ $node['Set'].json['timestamp'] }}",
       "total_processed": "{{ $node['Split In Batches'].json['total'] }}"
     }
   }
   ```

### **Step 7: Save and Activate**

1. **Click "Save"** (Ctrl+S)
2. **Click the "Active" toggle** to activate
3. **Test the webhook URL**: `http://localhost:5678/webhook/warm-outreach`

---

## **🎯 Phase 2: Advanced Workflows**

### **Cold Outreach Workflow**

**Create new workflow: "Cold Outreach Campaign"**

#### **Nodes:**

1. **Webhook Trigger** (path: `cold-outreach`)
2. **Set Node** (process data)
3. **Split In Batches** (batch size: 3)
4. **Function Node** (email sequence logic)
5. **Schedule Trigger** (for follow-ups)
6. **HTTP Request** (response webhook)

#### **Function Node Code:**

```javascript
const prospects = $node['Split In Batches'].json.prospects
const settings = $node['Set'].json.sequence_settings
const results = []

for (const prospect of prospects) {
  // Create email sequence based on settings
  const emailSequence = []

  for (let i = 0; i < settings.total_emails; i++) {
    const intervalDays = settings.intervals_days[i] || 3
    const sendDate = new Date()
    sendDate.setDate(sendDate.getDate() + i * intervalDays)

    emailSequence.push({
      email_number: i + 1,
      send_date: sendDate.toISOString(),
      personalization: settings.personalization_level,
      prospect: prospect,
    })
  }

  results.push({
    prospect: prospect,
    email_sequence: emailSequence,
    status: 'scheduled',
  })
}

return results.map(result => ({ json: result }))
```

### **Content Marketing Workflow**

**Create new workflow: "Content Marketing Automation"**

#### **Nodes:**

1. **Webhook Trigger** (path: `content-marketing`)
2. **Set Node** (process content data)
3. **Function Node** (content generation logic)
4. **Schedule Trigger** (posting schedule)
5. **HTTP Request** (social media APIs)
6. **HTTP Request** (response webhook)

#### **Function Node Code:**

```javascript
const contentType = $node['Set'].json.content_type
const topics = $node['Set'].json.topics
const schedule = $node['Set'].json.schedule

const contentPlan = []

topics.forEach((topic, index) => {
  const postDate = new Date()

  // Calculate posting schedule
  if (schedule.frequency === 'daily') {
    postDate.setDate(postDate.getDate() + index)
  } else if (schedule.frequency === 'weekly') {
    postDate.setDate(postDate.getDate() + index * 7)
  } else {
    postDate.setMonth(postDate.getMonth() + index)
  }

  contentPlan.push({
    topic: topic,
    content_type: contentType,
    scheduled_date: postDate.toISOString(),
    status: 'scheduled',
    platform_specific: {
      linkedin: topic.includes('business') || topic.includes('professional'),
      facebook: topic.includes('general') || topic.includes('lifestyle'),
      twitter: topic.includes('news') || topic.includes('quick'),
    },
  })
})

return [{ json: { content_plan, total_posts: contentPlan.length } }]
```

### **Paid Ads Workflow**

**Create new workflow: "Paid Advertising Campaign"**

#### **Nodes:**

1. **Webhook Trigger** (path: `paid-ads`)
2. **Set Node** (process ad data)
3. **Function Node** (ad creation logic)
4. **HTTP Request** (ad platform APIs)
5. **Wait Node** (campaign monitoring)
6. **HTTP Request** (response webhook)

#### **Function Node Code:**

```javascript
const platform = $node['Set'].json.platform
const campaignType = $node['Set'].json.campaign_type
const budget = $node['Set'].json.budget
const adCreative = $node['Set'].json.ad_creative

const campaignConfig = {
  platform: platform,
  campaign_type: campaignType,
  budget: budget,
  creative: adCreative,
  targeting: $node['Set'].json.target_audience,
  start_date: new Date().toISOString(),
  estimated_reach: Math.floor(budget.daily_budget * 100), // Mock calculation
  status: 'created',
}

// Platform-specific configurations
if (platform === 'google') {
  campaignConfig.keywords = ['lead generation', 'business growth', 'automation']
  campaignConfig.bid_strategy = 'maximize_conversions'
} else if (platform === 'facebook') {
  campaignConfig.placements = ['feed', 'stories', 'right_column']
  campaignConfig.optimization_goal = 'lead_generation'
} else if (platform === 'linkedin') {
  campaignConfig.campaign_format = 'sponsored_content'
  campaignConfig.targeting_type = 'professional'
}

return [{ json: campaignConfig }]
```

---

## **📥 Import Ready-Made Workflows**

### **Option 1: Import JSON (Fastest)**

Copy these workflow JSONs and import them directly into n8n:

#### **Warm Outreach Workflow JSON:**

```json
{
  "name": "Warm Outreach Campaign",
  "nodes": [
    {
      "parameters": {
        "path": "warm-outreach",
        "responseMode": "responseCode",
        "responseCode": 200,
        "httpMethod": "POST"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [320, 300]
    },
    {
      "parameters": {
        "keepOnlySet": false,
        "values": {
          "string": [
            {
              "name": "userId",
              "value": "={{ $json.userId }}"
            },
            {
              "name": "contacts",
              "value": "={{ $json.contacts }}"
            },
            {
              "name": "message_template",
              "value": "={{ $json.message_template || \"Hi {{name}}, I wanted to reach out...\" }}"
            }
          ]
        }
      },
      "name": "Set",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [520, 300]
    },
    {
      "parameters": {
        "batchSize": 5,
        "batchInterval": 1000
      },
      "name": "Split In Batches",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 1,
      "position": [720, 300]
    },
    {
      "parameters": {
        "functionCode": "const contacts = $node[\"Split In Batches\"].json.contacts;\nconst messageTemplate = $node[\"Set\"].json.message_template;\nconst results = [];\n\nfor (const contact of contacts) {\n  let personalizedMessage = messageTemplate\n    .replace(/{{name}}/g, contact.name || 'there')\n    .replace(/{{company}}/g, contact.company || 'your company');\n  \n  results.push({\n    email: contact.email,\n    name: contact.name,\n    company: contact.company,\n    message: personalizedMessage,\n    processed_at: new Date().toISOString(),\n    status: 'processed'\n  });\n}\n\nreturn results.map(result => ({ json: result }));"
      },
      "name": "Function",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [920, 300]
    },
    {
      "parameters": {
        "url": "http://localhost:3000/api/n8n-workflows/webhook",
        "sendBody": true,
        "bodyContentType": "json",
        "jsonBody": "{\n  \"workflowType\": \"warm-outreach\",\n  \"userId\": \"{{ $node['Set'].json['userId'] }}\",\n  \"executionId\": \"{{ $runIndex }}\",\n  \"status\": \"completed\",\n  \"data\": {\n    \"contacts\": \"{{ $node['Split In Batches'].json['contacts'] }}\",\n    \"processed_contacts\": \"{{ $json }}\",\n    \"total_processed\": \"{{ $node['Split In Batches'].json['total'] }}\"\n  }\n}"
      },
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1120, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Set",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set": {
      "main": [
        [
          {
            "node": "Split In Batches",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Split In Batches": {
      "main": [
        [
          {
            "node": "Function",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Function": {
      "main": [
        [
          {
            "node": "HTTP Request",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {},
  "id": 1
}
```

### **How to Import:**

1. **Copy the JSON above**
2. **In n8n, click "Settings" → "Import from JSON"**
3. **Paste the JSON and click "Import"**
4. **Click "Save" and toggle "Active"**

---

## **🧪 Testing Your Workflows**

### **Test Warm Outreach:**

```powershell
# Run this in PowerShell
$testData = @{
    userId = "test-user-123"
    contacts = @(
        @{
            email = "test1@example.com"
            name = "John Doe"
            company = "Test Company 1"
        },
        @{
            email = "test2@example.com"
            name = "Jane Smith"
            company = "Test Company 2"
        }
    )
    message_template = "Hi {{name}}, I wanted to reach out about {{company}}..."
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5678/webhook/warm-outreach" -Method POST -ContentType "application/json" -Body $testData
```

### **Expected Result:**

- ✅ n8n executes successfully
- ✅ Your Next.js API receives webhook data
- ✅ Leads are created in your database
- ✅ You can see them in the dashboard

---

## **📝 Quick Setup Checklist**

### **Phase 1 (Required):**

- [ ] Create "Warm Outreach Campaign" workflow
- [ ] Configure webhook trigger (path: `warm-outreach`)
- [ ] Add data processing nodes
- [ ] Test with sample data
- [ ] Verify leads appear in dashboard

### **Phase 2 (Optional for now):**

- [ ] Create "Cold Outreach Campaign" workflow
- [ ] Create "Content Marketing Automation" workflow
- [ ] Create "Paid Advertising Campaign" workflow
- [ ] Test all workflows
- [ ] Monitor execution logs

### **Common Issues:**

1. **404 webhook error** → Workflow not active
2. **Connection refused** → n8n not running
3. **No leads in dashboard** → Webhook URL incorrect
4. **JSON errors** → Check webhook response format

---

## **🚀 Ready to Proceed to Phase 3**

**You can continue to Phase 3 with just the basic warm outreach workflow!** The system is designed to work progressively - add more workflows as you build them.

**Next**: I'll build Phase 3 components while you set up the workflows.

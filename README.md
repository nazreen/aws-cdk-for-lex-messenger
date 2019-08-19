# Todo
- custom resource for lex (us-east-1 region)
- specify lex resource for iam policy

# Problem statement
For chatbot integrations, sometimes, you need to do some preprocessing with a message before it hits Lex. For example, you might be dealing with informal language and need to normalise the message using an external API before sending it over to Lex.

# Solution overview
Setup a custom webhook to be supplied to the chat platform. The webhook will be handled by an API Gateway endpoint that is integrated with a Lambda function. In that Lambda function, Lex is called, amongst other things.

# Pre-requisites
- `cdk` installed on local machine

# Setup:
## 1. Prepare the Facebook components
- Create Facebook page
- Create Facebook app
- in Facebook app, add Product 'Messenger'
- link product to created page
- click on generate token for that page. note this for Step 3
## 2. Create the Lexbot
- use the quick launch template or create your own, note the bot name for the next step.
- create an alias, such as 'latest', note this for the next step.
## 3. Deploy the stack
- run `cdk deploy`
- Go to the created Lamdba, fill the env vars:
  - BOT_NAME from Step 2
  - BOT_ALIAS from Step 2
  - PAGE_TOKEN from Step 1
  - VERIFY_TOKEN can be any string you set. note this for Step 4.
## 4. Connect the webhook
- go back to the product setup page. click on 'add webook'
- paste in the API_URL/webhook
- paste in the same verify token from Step 3
- it should be added if you've done everything above correctly. a common cause of error is not having the correct mapping template.
## 5. Test it
- send a message to the page using the developer's facebook account. it should work.
# Todo
- ensure request template works
- set lambda to use env variables
- upload to git
- send to shazli

# Problem statement
For chatbot integrations, sometimes, you need to do some preprocessing with a message before it hits Lex. For example, you might be dealing with informal language and need to normalise the message using an external API before sending it over to Lex.

# Solution overview
Setup a custom webhook to be supplied to the chat platform. The webhook will be handled by an API Gateway endpoint that is integrated with a Lambda function. In that Lambda function, Lex is called, amongst other things.

# Components
## AWS
- AWS::ApiGateway::RestApi
- AWS::ApiGateway::Method
- AWS::ApiGateway::Deployment
- AWS::Lambda::Function
- AWS::Lambda::Permission
- AWS::IAM::Role
- AWS::Logs::LogGroup
- lex
## Others
- Facebook app
  - Messenger product
    - page token (connect page to the app through the Messenger product)
    - webhook integration (with the appropriate subscriptions)

# Setup:
## Prepare the Facebook components
- Create Facebook page
- Create Facebook app
- in Facebook app, add Product 'Messenger'
- link product to created page
- click on generate token for that page. copy this token for pasting into lambda later.
## Create the Lexbot
- use the quick launch template or create your own,.
## Create the lambda
- modify the lambda code.
  - copy in the page token
  - set your own verification token. this can be any string. you paste the same one later when you integrate your app in the webhook section.
## Create API 
- create resource. name it 'webhook'
- create GET method for that resource. select Lambda integration without Lambda proxy integration
- in the GET integration request, select Mapping Template. type in application/json then select generate template 'method request passthrough'
- create POST method. for the integration select Lambda integration, do not select 'Lambda proxy integration'. select the created Lambda. 
- deploy the API. copy the API url.
## Connect the webhook
- go back to the product setup page. click on 'add webook'. paste in the API_URL/webhook and click save
- it should be added if you've done everything above correctly. a common cause of error is not having the correct mapping template.
## Test it
- send a message to the page using the developer's facebook account. it should work.
import apigateway = require('@aws-cdk/aws-apigateway');
import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');

const mrptValue = "#set($allParams = $input.params())\r\n{\r\n\"body-json\" : $input.json('$'),\r\n\"params\" : {\r\n#foreach($type in $allParams.keySet())\r\n    #set($params = $allParams.get($type))\r\n\"$type\" : {\r\n    #foreach($paramName in $params.keySet())\r\n    \"$paramName\" : \"$util.escapeJavaScript($params.get($paramName))\"\r\n        #if($foreach.hasNext),#end\r\n    #end\r\n}\r\n    #if($foreach.hasNext),#end\r\n#end\r\n},\r\n\"stage-variables\" : {\r\n#foreach($key in $stageVariables.keySet())\r\n\"$key\" : \"$util.escapeJavaScript($stageVariables.get($key))\"\r\n    #if($foreach.hasNext),#end\r\n#end\r\n},\r\n\"context\" : {\r\n    \"account-id\" : \"$context.identity.accountId\",\r\n    \"api-id\" : \"$context.apiId\",\r\n    \"api-key\" : \"$context.identity.apiKey\",\r\n    \"authorizer-principal-id\" : \"$context.authorizer.principalId\",\r\n    \"caller\" : \"$context.identity.caller\",\r\n    \"cognito-authentication-provider\" : \"$context.identity.cognitoAuthenticationProvider\",\r\n    \"cognito-authentication-type\" : \"$context.identity.cognitoAuthenticationType\",\r\n    \"cognito-identity-id\" : \"$context.identity.cognitoIdentityId\",\r\n    \"cognito-identity-pool-id\" : \"$context.identity.cognitoIdentityPoolId\",\r\n    \"http-method\" : \"$context.httpMethod\",\r\n    \"stage\" : \"$context.stage\",\r\n    \"source-ip\" : \"$context.identity.sourceIp\",\r\n    \"user\" : \"$context.identity.user\",\r\n    \"user-agent\" : \"$context.identity.userAgent\",\r\n    \"user-arn\" : \"$context.identity.userArn\",\r\n    \"request-id\" : \"$context.requestId\",\r\n    \"resource-id\" : \"$context.resourceId\",\r\n    \"resource-path\" : \"$context.resourcePath\"\r\n    }\r\n}\r\n"


export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'lex-poc-api')
    const webhookResource = api.root.addResource('webhook');

    const webhookHandler = new lambda.Function(this, 'incoming-message-handler', {
      code: lambda.Code.asset('lambda'),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(3),
      runtime: lambda.Runtime.NODEJS_10_X,
    });
    // TODO: create integration
    const webhookIntegrationOptions = {
      proxy: false,
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      requestTemplates: {
        'application/json': mrptValue
      }
    }
    const webhookIntegration = new apigateway.LambdaIntegration(webhookHandler, webhookIntegrationOptions)
    webhookResource.addMethod('GET', webhookIntegration)
    webhookResource.addMethod('POST', webhookIntegration)
  }
}

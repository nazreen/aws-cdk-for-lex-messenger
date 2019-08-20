import apigateway = require('@aws-cdk/aws-apigateway');
import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import iam = require('@aws-cdk/aws-iam');
import mrptValue from './mapping_request_template';
// import { MyCustomResource } from './my-custom-resource';
import { CustomLexIntent } from './custom_lex_intent/lex-intent';

// currently Lex is supported in a limited number of regions
const LEX_REGION = "us-east-1"

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const ACCOUNT_ID = cdk.Stack.of(this).account
    const STACK_NAME = cdk.Stack.of(this).stackName

    /*
      Setup IAM Permissions
    */
    const lexPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [`arn:aws:lex:${LEX_REGION}:${ACCOUNT_ID}:bot:*:*`, `arn:aws:lex:${LEX_REGION}:${ACCOUNT_ID}:intent:*:*`],
      actions: ['lex:*'] // TODO: specify to only PostText and create separate Role for the lambda custom resource provider
    })
    const logPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['logs:*']
    })
    const policyDocument = new iam.PolicyDocument()
    policyDocument.addStatements(lexPolicyStatement)
    policyDocument.addStatements(logPolicyStatement)
    const roleProps = {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        'lex-post-text': policyDocument
      }
    }
    const webhookHandlerRole = new iam.Role(this, 'lambda-role-with-lex', roleProps)

    /*
      Setup Lambda
    */
    const webhookHandler = new lambda.Function(this, 'incoming-message-handler', {
      code: lambda.Code.asset('lambda'),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(3),
      runtime: lambda.Runtime.NODEJS_10_X,
      role: webhookHandlerRole
    });

    /* 
      Setup API Gateway
    */
    const api = new apigateway.RestApi(this, 'lex-poc-api')
    const webhookResource = api.root.addResource('webhook');
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

    /*
     Custom Resource
    */
    // const propsForLambdaProvider = {
    //   stackName: STACK_NAME
    // };
    // const resource = new MyCustomResource(this, 'custom-resource-lex-bot', propsForLambdaProvider, webhookHandlerRole);
    const lexIntent = new CustomLexIntent(this, 'custom-lex-intent', { stackName: STACK_NAME }, webhookHandlerRole)

    // Publish the custom resource output
    // new cdk.CfnOutput(this, 'ResponseMessage', {
    //   description: 'The message that came back from the Custom Resource',
    //   value: resource.response
    // });

    new cdk.CfnOutput(this, 'lex-intent', {
      description: 'The name of the lex intent',
      value: lexIntent.name
    });
  }
}

import apigateway = require('@aws-cdk/aws-apigateway');
import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import iam = require('@aws-cdk/aws-iam');
import mrptValue from './mapping_request_template';

// currently Lex is supported in a limited number of regions
const LEX_REGION = "us-east-1"

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const ACCOUNT_ID = cdk.Stack.of(this).account

    /*
      Setup IAM Permissions
    */
    const lexPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [`arn:aws:lex:${LEX_REGION}:${ACCOUNT_ID}:bot:*:*`],
      actions: ['lex:PostText']
    })
    const policyDocument = new iam.PolicyDocument()
    policyDocument.addStatements(lexPolicyStatement)
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
  }
}

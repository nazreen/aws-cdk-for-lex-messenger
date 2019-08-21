import cfn = require('@aws-cdk/aws-cloudformation');
import lambda = require('@aws-cdk/aws-lambda');
import iam = require('@aws-cdk/aws-iam');
import cdk = require('@aws-cdk/core');

import fs = require('fs');

const providerPath = 'lib/custom_lex_bot/lex-bot-provider.py'
const functionName = 'lex-bot-provider'

export interface IPropsForCustomLexBot {
    BotName: string;
}

export class CustomLexBot extends cdk.Construct {
    public readonly name: string;

    constructor(scope: cdk.Construct, id: string, lambdaProps: IPropsForCustomLexBot, role: iam.Role) {
        super(scope, id);

        const resource = new cfn.CustomResource(this, 'Resource', {
            provider: cfn.CustomResourceProvider.lambda(new lambda.SingletonFunction(this, functionName, {
                uuid: 'a6ffed12-b0d3-4ccc-894d-ffa379e109e2',
                code: new lambda.InlineCode(fs.readFileSync(providerPath, { encoding: 'utf-8' })),
                handler: 'index.main',
                timeout: cdk.Duration.seconds(15),
                runtime: lambda.Runtime.PYTHON_3_7,
                functionName,
                role
            })),
            properties: lambdaProps,
            resourceType: 'Custom::LexBot'
        });

        this.name = resource.getAtt('name').toString();
    }
}


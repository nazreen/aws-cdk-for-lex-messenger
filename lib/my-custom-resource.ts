import cfn = require('@aws-cdk/aws-cloudformation');
import lambda = require('@aws-cdk/aws-lambda');
import iam = require('@aws-cdk/aws-iam');
import cdk = require('@aws-cdk/core');

import fs = require('fs');

export interface MyCustomResourceProps {
    /**
     * Message to echo
     */
    message: string;
}

export class MyCustomResource extends cdk.Construct {
    public readonly response: string;

    constructor(scope: cdk.Construct, id: string, props: MyCustomResourceProps, role: iam.Role) {
        super(scope, id);

        const resource = new cfn.CustomResource(this, 'Resource', {
            provider: cfn.CustomResourceProvider.lambda(new lambda.SingletonFunction(this, 'custom-resource-provider', {
                uuid: 'f7d4f730-4ee1-11e8-9c2d-fa7ae01bbebc',
                code: new lambda.InlineCode(fs.readFileSync('lib/custom-resource-handler.py', { encoding: 'utf-8' })),
                handler: 'index.main',
                timeout: cdk.Duration.seconds(10),
                runtime: lambda.Runtime.PYTHON_3_7,
                role
            })),
            properties: props,
            resourceType: 'Custom::LexBot'
        });

        this.response = resource.getAtt('Response').toString();
    }
}


cfn-lint index.template
aws cloudformation deploy --stack-name lambda-lex --template-file index.template --capabilities CAPABILITY_IAM --parameter-overrides lambdaFunctionName=webhook-lambda KeyName=cfexps InstanceType=t2.micro



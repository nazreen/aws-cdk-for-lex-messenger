#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();
const suffix = ''
new CdkStack(app, 'lex-messenger-poc' + suffix);
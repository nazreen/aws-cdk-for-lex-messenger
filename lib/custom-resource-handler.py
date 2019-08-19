def main(event, context):
    import logging as log
    import cfnresponse
    import boto3
    
    lex = boto3.client('lex-models', region_name='us-east-1')
    log.getLogger().setLevel(log.INFO)
    # create intent
    # This needs to change if there are to be multiple resources in the same stack
    physical_id = 'custom-resource-lex'
    bot_name = 'SubmitComplaintSixteen' # cannot have number in bot name
    intent_name = 'ComplainSixteen'
    bot = None
    try:
        log.info('Input event: %s', event)
        if event['RequestType'] in ['Create','Update']:
            try:
                bot = lex.get_bot(name=bot_name,versionOrAlias='$LATEST')
            except:
                print('initial check: bot does not exist yet.')

            if event['RequestType'] == 'Create':
                lex.put_intent(name=intent_name)
            sample_intent = {
                'intentName': intent_name,
                'intentVersion': '$LATEST'
            }
            clarification_prompt={
                'messages': [
                    {
                        'contentType': 'PlainText',
                        'content': 'Sorry I do not understand what you are saying',
                        'groupNumber': 1
                    },
                ],
                'maxAttempts': 3
            }
            abort_statement={
                'messages': [
                    {
                        'contentType': 'PlainText',
                        'content': 'Oh oh, I amm sorry',
                        'groupNumber': 1
                    },
                ],
                'responseCard': 'string'
            }
            if bot is not None:
                print('bot is going to be updated')
                print(bot)
                checksum = bot['checksum']
                lex_response = lex.put_bot(
                    name=bot_name,
                    childDirected=False,
                    locale='en-US',
                    checksum=checksum,
                    intents=[sample_intent],
                    clarificationPrompt=clarification_prompt,
                    abortStatement=abort_statement
                )
                print('after updated')
            else:
                print('bot needs to be created')
                lex_response = lex.put_bot(
                    name=bot_name,
                    childDirected=False,
                    locale='en-US',
                    intents=[sample_intent],
                    clarificationPrompt=clarification_prompt,
                    abortStatement=abort_statement
                )
                print('after creation')
        elif event['RequestType'] == 'Delete':
            lex.delete_intent(name=intent_name)
            lex.delete_bot(name=bot_name)
        print('approaching end')
        # Do the thing
        # message = event['ResourceProperties']['Message']
        output_attributes = {
            'Response': 'You said'
        }
        cfnresponse.send(event, context, cfnresponse.SUCCESS, output_attributes, physical_id)
    except Exception as e:
        log.exception(e)
        # cfnresponse's error message is always "see CloudWatch"
        cfnresponse.send(event, context, cfnresponse.FAILED, {}, physical_id)

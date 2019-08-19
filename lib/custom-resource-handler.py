def main(event, context):
    import logging as log
    import cfnresponse
    import boto3
    
    lex = boto3.client('lex-models', region_name='us-east-1')
    log.getLogger().setLevel(log.INFO)

    # This needs to change if there are to be multiple resources in the same stack
    physical_id = 'custom-resource-lex'
    bot_name = 'SubmitComplaint'
    try:
        log.info('Input event: %s', event)
        if event['RequestType'] in ['Create','Update']:
            log.info('Before lex bot creation')
            lex_response = lex.put_bot(
                name=bot_name,
                childDirected=False,
                locale='en-US',
                clarificationPrompt={
                    'messages': [
                        {
                            'contentType': 'PlainText',
                            'content': 'Sorry I do not understand what you are saying',
                            'groupNumber': 1
                        },
                    ],
                    'maxAttempts': 3
                },
            )
            log.info('after creation')
        elif event['RequestType'] == 'Delete':
            lex.delete_bot(name=bot_name)

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

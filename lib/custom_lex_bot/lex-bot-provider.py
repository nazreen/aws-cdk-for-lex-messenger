def main(event, context):
    import logging as log
    import cfnresponse
    import boto3
    lex = boto3.client('lex-models', region_name='us-east-1')
    log.getLogger().setLevel(log.INFO)

    try:
        lex = boto3.client('lex-models', region_name='us-east-1')
        log.getLogger().setLevel(log.INFO)
        
        bot_name = event['ResourceProperties']['BotName']
        physical_id = bot_name
        bot = None
        log.info('Input event: %s', event)
        
        try:
            # check if already exists
            bot = lex.get_bot(name=bot_name,version='$LATEST')
            # if already exists, call CREATE does update,  DELETE does delete
            if event['RequestType'] in ['Create','Update']:
                bot = lex.put_bot(name=bot_name, checksum=bot['checksum'])
            elif event['RequestType'] == 'Delete':
                lex.delete_bot(name=bot_name)
                output_attributes = {}
        except:
            # if resource does not yet exist, call CREATE does create or DELETE skips delete
            if event['RequestType'] in ['Create','Update']:
                bot = lex.put_bot(name=bot_name,locale='en-US',childDirected=False)
            elif event['RequestType'] == 'Delete':
                pass
            
        output_attributes = {
            'name': bot['name']
        }
            
        cfnresponse.send(event, context, cfnresponse.SUCCESS, output_attributes, physical_id)
    except Exception as e:
        log.exception(e)
        # cfnresponse's error message is always "see CloudWatch"
        cfnresponse.send(event, context, cfnresponse.FAILED, {}, physical_id)

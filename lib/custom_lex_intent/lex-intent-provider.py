def main(event, context):
    import logging as log
    import cfnresponse
    import boto3
    lex = boto3.client('lex-models', region_name='us-east-1')
    log.getLogger().setLevel(log.INFO)
    # create intent
    
    intent_name = 'Complain'
    physical_id = intent_name
    intent = None
    try:
        log.info('Input event: %s', event)

        
        try:
            # check if already exists
            intent = lex.get_intent(name=intent_name,version='$LATEST')
            # if already exists, call CREATE does update,  DELETE does delete
            if event['RequestType'] in ['Create','Update']:
                intent = lex.put_intent(name=intent_name, checksum=intent['checksum'])
            elif event['RequestType'] == 'Delete':
                lex.delete_intent(name=intent_name)
                output_attributes = {}
        except:
            # if resource does not yet exist, call CREATE does create or DELETE skips delete
            if event['RequestType'] in ['Create','Update']:
                intent = lex.put_intent(name=intent_name)
            elif event['RequestType'] == 'Delete':
                pass
            
        output_attributes = {
            'name': intent['name']
        }
            
        cfnresponse.send(event, context, cfnresponse.SUCCESS, output_attributes, physical_id)
    except Exception as e:
        log.exception(e)
        # cfnresponse's error message is always "see CloudWatch"
        cfnresponse.send(event, context, cfnresponse.FAILED, {}, physical_id)

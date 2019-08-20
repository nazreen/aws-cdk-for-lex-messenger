def main(event, context):
    import logging as log
    import cfnresponse
    import boto3
    lex = boto3.client('lex-models', region_name='us-east-1')
    log.getLogger().setLevel(log.INFO)
    # create intent
    physical_id = 'custom-resource-lex-intent'

    intent_name = 'Complain'
    intent = None
    try:
        log.info('Input event: %s', event)
        if event['RequestType'] in ['Create','Update']:
            intent = lex.put_intent(name=intent_name)
            # try:
            #     # check if already exists
            #     intent = lex.get_intent(name=intent_name,version='$LATEST')
            #     # if already exists, attempt updated
            #     intent = lex.put_intent(name=intent_name, checksum=intent['checksum'])
            # except:
            #     # if not yet exist, create
            #     intent = lex.put_intent(name=intent_name)
            output_attributes = {
                'name': intent['name']
            }
        elif event['RequestType'] == 'Delete':
            lex.delete_intent(name=intent_name)
            output_attributes = {}
        
        cfnresponse.send(event, context, cfnresponse.SUCCESS, output_attributes, physical_id)
    except Exception as e:
        log.exception(e)
        # cfnresponse's error message is always "see CloudWatch"
        cfnresponse.send(event, context, cfnresponse.FAILED, {}, physical_id)

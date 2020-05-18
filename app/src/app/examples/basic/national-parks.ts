import { JsfDocument } from '@kalmia/jsf-common-es2015';


export const exampleNationalParks1309: JsfDocument = {
  '$description': 'National Parks List Demo',
  '$modes'      : [],
  'schema'      : {
    'type'      : 'object',
    'properties': {
      'emergencyEmail': {
        'type'      : 'string',
        'format'    : 'email',
        dependencies: ['parks']
      },
      'parks'         : {
        'type' : 'array',
        'items': {

          'type'    : 'object',
          properties: {
            name: {
              'title'    : 'Park name',
              'type'     : 'string',
              'minLength': 3,

              onValueChange: {
                updateDependencyValue: [
                  {
                    key  : 'emergencyEmail',
                    value: {
                      $eval: 'return "123123"',
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  'layout'      : {
    'type' : 'div',
    'items': [
      { key: 'emergencyEmail' },
      {
        'type' : 'array',
        'key'  : 'parks',
        'items': [
          { 'key': 'parks[].name' }
        ]
      },
      {
        'type' : 'array-item-add',
        'path' : 'parks',
        'title': 'Add new park'
      }
    ]
  }
} as any;

import { JsfDocument, JsfLayoutDiv, JsfPropObject } from '../../src';

export const testDocument: JsfDocument = {
  $description: 'JSF Kitchen Sink',
  $schema     : 'http://jsf.kalmia.si/draft-1',
  $style      : '.custom-class { color: pink; text-shadow: 2px 2px #ff0000; }',
  $theme      : 'dark-royal',

  schema: new JsfPropObject({
    type      : 'object',
    properties: {

      constExample: {
        'title': 'Terms of service',
        'type' : 'string',
        'const': 'Please read our Privacy Policy carefully.',
      },

      basic: {
        type      : 'object',
        properties: {
          username: {
            'title'      : 'Username',
            'description': 'Your username will be visible to others.',
            'type'       : 'string',
            'pattern'    : '^[^/]*$',
            'minLength'  : 2,
          },
          password: {
            'title'    : 'Password',
            'type'     : 'string',
            'secret'   : true,
            'minLength': 8,
          },
          weight  : {
            'title': 'Your weight (kg)',
            'type' : 'number',
          },
          age     : {
            'title': 'Your age',
            'type' : 'integer',
          },
          birthday: {
            'title': 'Your birthday',
            'type' : 'date',
          },

          moreInfo: {
            'type'      : 'object',
            'properties': {
              'phone': {
                'type'       : 'string',
                'title'      : 'Phone number',
                'description': 'Use +386 prefix',
              },
              // 'gender': {
              //   'type'       : 'string',
              //   'title'      : 'Gender',
              //   enum: [ 'M', 'F' ],
              //   handler: {
              //     type: 'radio'
              //   }
              // }
            },
          },
        },
      },

      filesDemo: {
        type      : 'object',
        properties: {
          fileAsString: {
            title  : 'File upload (as string)',
            type   : 'string',
            // handler: {
            //   type: 'file',
            // },
          },
          fileAsBinary: {
            title      : 'File upload (as binary)',
            type       : 'string', // Draft 8.0: change to binary
            contentType: 'image/png',
            // handler    : {
            //   type: 'file',
            // },
          } as any,
          fileAsId    : {
            title  : 'File upload (as id)',
            type   : 'id',
            // handler: {
            //   type: 'file',
            // },
          },
        },
      },

      arrayDemo: {
        type      : 'object',
        properties: {

          // PRODUCES VALUE
          // "fixedArray": [ "SI",  "248439925" ]
          fixedArray: {
            type   : 'array',
            'items': [
              {
                'title': 'VAT country code',
                'type' : 'string',
              },
              {
                'title': 'VAT number',
                'type' : 'number',
              },
            ],
          },

          // PRODUCES VALUE
          // "simpleArray": [ "car", "cat" ]
          simpleArray: {
            type   : 'array',
            'items': {
              'title': 'Tags',
              'type' : 'string',
            },
          },

          // PRODUCES VALUE
          // "objectArray": [
          //   { "name": "John", "surname": "Snow" },
          //   { "name": "Alice", "surname": ""  }
          // ]
          objectArray: {
            type   : 'array',
            'items': {
              type      : 'object',
              title     : 'Contacts list',
              properties: {
                name        : {
                  'title': 'Name',
                  'type' : 'string',
                },
                surname     : {
                  'title': 'Surname',
                  'type' : 'string',
                },
                phoneNumbers: {
                  type   : 'array',
                  'items': {
                    'title': 'Phone number',
                    'type' : 'string',
                  },
                },
              },
            },
          },

          // PRODUCES VALUE
          // "guests4": [ [1, 2, 3], [3, 2, 1] ],
          nestedArray: {
            title: 'Matrix',
            type : 'array',
            items: {
              type : 'array',
              items: {
                title: 'Vector',
                type : 'integer',
              },
            },
          },
        },
      },
    },
  }),

  layout: new JsfLayoutDiv({
    type : 'div',
    items: [
      {
        key: 'constExample',
      },
      {
        type : 'tabset',
        items: [
          {
            title: 'TAB: ARRAY DEMO',
            type : 'tab',
            items: [
              {
                type : 'div',
                items: [
                  {
                    key: 'arrayDemo.fixedArray[0]',
                  },
                  {
                    key: 'arrayDemo.fixedArray[1]',
                  },
                ],
              },
              {
                key  : 'arrayDemo.simpleArray',
                type : 'array',
                items: [
                  {
                    key: 'arrayDemo.simpleArray[]',
                  },
                ],
              },
              {
                type : 'array',
                key  : 'arrayDemo.objectArray',
                items: [
                  {
                    key: 'arrayDemo.objectArray[].name',
                  },
                  {
                    key: 'arrayDemo.objectArray[].surname',
                  },
                  {
                    type : 'div',
                    items: [
                      {
                        type : 'array',
                        key  : 'arrayDemo.objectArray[].phoneNumbers',
                        items: [
                          {
                            key: 'arrayDemo.objectArray[].phoneNumbers[]',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                key  : 'arrayDemo.nestedArray',
                type : 'array',
                items: [
                  {
                    key  : 'arrayDemo.nestedArray[]',
                    type : 'array',
                    items: [
                      {
                        key: 'arrayDemo.nestedArray[][]',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            title   : 'TAB: BASIC',
            selected: true,
            type    : 'tab',
            items   : [
              {
                type  : 'div',
                styles: {
                  grid: 'row',
                },
                items : [
                  {
                    type  : 'div',
                    styles: {
                      grid: 'col-lg-2 col-md-3 col-sm-6 col-xs-12',
                    },
                    items : [
                      {
                        key: 'basic.username',
                      },
                    ],
                  },
                  {
                    type  : 'div',
                    styles: {
                      grid: 'col-lg-2 col-md-3 col-sm-6 col-xs-12',
                    },
                    items : [
                      {
                        key: 'basic.password',
                      },
                    ],
                  },
                  {
                    type  : 'div',
                    styles: {
                      grid: 'col-lg-2 col-md-3 col-sm-6 col-xs-12',
                    },
                    items : [
                      {
                        key: 'basic.weight',
                      },
                    ],
                  },
                  {
                    type  : 'div',
                    styles: {
                      grid: 'col-lg-2 col-md-3 col-sm-6 col-xs-12',
                    },
                    items : [
                      {
                        key: 'basic.age',
                      },
                    ],
                  },
                  {
                    type  : 'div',
                    styles: {
                      grid: 'col-lg-2 col-md-3 col-sm-6 col-xs-12',
                    },
                    items : [
                      {
                        key: 'basic.birthday',
                      },
                    ],
                  },
                  {
                    type  : 'div',
                    styles: {
                      grid: 'col-lg-2 col-md-3 col-sm-6 col-xs-12',
                    },
                    items : [
                      {
                        key: 'basic.moreInfo.phone',
                      },
                    ],
                  },
                ],
              },

              // {
              //   key: 'basic.moreInfo.gender'
              // }
            ],
          },
          {
            title: 'TAB: FILES DEMO',
            type : 'tab',
            items: [
              {
                key: 'filesDemo.fileAsString',
              },
              {
                key: 'filesDemo.fileAsBinary',
              },
              {
                key: 'filesDemo.fileAsId',
              },
            ],
          },
        ],
      },
    ],
  }),

  value: {
    'basic'    : {
      'username': 'root',
      'password': 'toor',
      'weight'  : 33.8,
      'age'     : 91,
      'moreInfo': {
        'phone': 'u',
      },
    },
    'filesDemo': {
      'fileAsString': null,
    },
    'arrayDemo': {
      'fixedArray' : [
        'SI',
        12345,
      ],
      'simpleArray': [
        'car',
        'cat',
      ],
      'objectArray': [
        {
          'name'        : 'John',
          'surname'     : 'Snow',
          'phoneNumbers': [
            '00386123123',
          ],
        },
      ],
      'nestedArray': [
        [
          '1',
          '2',
          '3',
        ],
      ],
    },
  },
};

request:
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises'; // for reading file with promises

dotenv.config();

async function detectTextWithLocalImage() {
  const apiKey = process.env.google_vision_api;
  }
  const imagePath = './coin.png';
  const imageBuffer = await fs.readFile(imagePath);
  const base64Image = imageBuffer.toString('base64');

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const requestBody = {
    requests: [
      {
        image: {
          content: base64Image,
        },
        features: [
          {
            type: 'TEXT_DETECTION',
          },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

detectTextWithLocalImage().catch(console.error);

respond:
coinvalue15@cloudshell:~ (windy-skyline-474112-d1)$ gcloud ml vision detect-text gs://coin_vault_coins/coin.jpg
{
  "responses": [
    {
      "fullTextAnnotation": {
        "pages": [
          {
            "blocks": [
              {
                "blockType": "TEXT",
                "boundingBox": {
                  "vertices": [
                    {
                      "x": 341,
                      "y": 330
                    },
                    {
                      "x": 427,
                      "y": 850
                    },
                    {
                      "x": 193,
                      "y": 889
                    },
                    {
                      "x": 106,
                      "y": 369
                    }
                  ]
                },
                "paragraphs": [
                  {
                    "boundingBox": {
                      "vertices": [
                        {
                          "x": 341,
                          "y": 330
                        },
                        {
                          "x": 427,
                          "y": 850
                        },
                        {
                          "x": 193,
                          "y": 889
                        },
                        {
                          "x": 106,
                          "y": 369
                        }
                      ]
                    },
                    "words": [
                      {
                        "boundingBox": {
                          "vertices": [
                            {
                              "x": 246,
                              "y": 367
                            },
                            {
                              "x": 222,
                              "y": 549
                            },
                            {
                              "x": 149,
                              "y": 540
                            },
                            {
                              "x": 173,
                              "y": 357
                            }
                          ]
                        },
                        "property": {
                          "detectedLanguages": [
                            {
                              "confidence": 1.0,
                              "languageCode": "hr"
                            }
                          ]
                        },
                        "symbols": [
                          {
                            "boundingBox": {
                              "vertices": [
                                {
                                  "x": 246,
                                  "y": 367
                                },
                                {
                                  "x": 238,
                                  "y": 430
                                },
                                {
                                  "x": 169,
                                  "y": 421
                                },
                                {
                                  "x": 177,
                                  "y": 358
                                }
                              ]
                            },
                            "text": "D"
                          },
                          {
                            "boundingBox": {
                              "vertices": [
                                {
                                  "x": 232,
                                  "y": 432
                                },
                                {
                                  "x": 224,
                                  "y": 494
                                },
                                {
                                  "x": 155,
                                  "y": 485
                                },
                                {
                                  "x": 164,
                                  "y": 423
                                }
                              ]
                            },
                            "text": "O"
                          },
                          {
                            "boundingBox": {
                              "vertices": [
                                {
                                  "x": 220,
                                  "y": 485
                                },
                                {
                                  "x": 212,
                                  "y": 548
                                },
                                {
                                  "x": 151,
                                  "y": 540
                                },
                                {
                                  "x": 160,
                                  "y": 477
                                }
                              ]
                            },
                            "property": {
                              "detectedBreak": {
                                "type": "SPACE"
                              }
                            },
                            "text": "S"
                          }
                        ]
                      },
                      {
                        "boundingBox": {
                          "vertices": [
                            {
                              "x": 213,
                              "y": 535
                            },
                            {
                              "x": 421,
                              "y": 809
                            },
                            {
                              "x": 351,
                              "y": 862
                            },
                            {
                              "x": 143,
                              "y": 588
                            }
                          ]
                        },
                        "property": {
                          "detectedLanguages": [
                            {
                              "confidence": 1.0,
                              "languageCode": "hr"
                            }
                          ]
                        },
                        "symbols": [
                          {
                            "boundingBox": {
                              "vertices": [
                                {
                                  "x": 209,
                                  "y": 544
                                },
                                {
                                  "x": 246,
                                  "y": 602
                                },
                                {
                                  "x": 197,
                                  "y": 633
                                },
                                {
                                  "x": 160,
                                  "y": 575
                                }
                              ]
                            },
                            "text": "V"
                          },
                          {
                            "boundingBox": {
                              "vertices": [
                                {
                                  "x": 280,
                                  "y": 656
                                },
                                {
                                  "x": 316,
                                  "y": 714
                                },
                                {
                                  "x": 267,
                                  "y": 744
                                },
                                {
                                  "x": 232,
                                  "y": 686
                                }
                              ]
                            },
                            "text": "O"
                          },
                          {
                            "boundingBox": {
                              "vertices": [
                                {
                                  "x": 312,
                                  "y": 697
                                },
                                {
                                  "x": 345,
                                  "y": 750
                                },
                                {
                                  "x": 291,
                                  "y": 783
                                },
                                {
                                  "x": 258,
                                  "y": 730
                                }
                              ]
                            },
                            "text": "D"
                          },
                          {
                            "boundingBox": {
                              "vertices": [
                                {
                                  "x": 347,
                                  "y": 739
                                },
                                {
                                  "x": 377,
                                  "y": 775
                                },
                                {
                                  "x": 326,
                                  "y": 817
                                },
                                {
                                  "x": 297,
                                  "y": 780
                                }
                              ]
                            },
                            "text": "I"
                          },
                          {
                            "boundingBox": {
                              "vertices": [
                                {
                                  "x": 373,
                                  "y": 766
                                },
                                {
                                  "x": 411,
                                  "y": 797
                                },
                                {
                                  "x": 369,
                                  "y": 848
                                },
                                {
                                  "x": 331,
                                  "y": 817
                                }
                              ]
                            },
                            "property": {
                              "detectedBreak": {
                                "type": "LINE_BREAK"
                              }
                            },
                            "text": "O"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ],
            "height": 1000,
            "property": {
              "detectedLanguages": [
                {
                  "confidence": 1.0,
                  "languageCode": "hr"
                }
              ]
            },
            "width": 1000
          }
        ],
        "text": "DOS VODIO"
      },
      "textAnnotations": [
        {
          "boundingPoly": {
            "vertices": [
              {
                "x": 106,
                "y": 330
              },
              {
                "x": 427,
                "y": 330
              },
              {
                "x": 427,
                "y": 889
              },
              {
                "x": 106,
                "y": 889
              }
            ]
          },
          "description": "DOS VODIO",
          "locale": "hr"
        },
        {
          "boundingPoly": {
            "vertices": [
              {
                "x": 246,
                "y": 367
              },
              {
                "x": 222,
                "y": 549
              },
              {
                "x": 149,
                "y": 540
              },
              {
                "x": 173,
                "y": 357
              }
            ]
          },
          "description": "DOS"
        },
        {
          "boundingPoly": {
            "vertices": [
              {
                "x": 213,
                "y": 535
              },
              {
                "x": 421,
                "y": 809
              },
              {
                "x": 351,
                "y": 862
              },
              {
                "x": 143,
                "y": 588
              }
            ]
          },
          "description": "VODIO"
        }
      ]
    }
  ]
}
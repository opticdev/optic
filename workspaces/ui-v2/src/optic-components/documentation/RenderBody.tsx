import * as React from 'react';
import { Typography } from '@material-ui/core';
import { IShapeRenderer, JsonLike } from '../shapes/ShapeRenderInterfaces';
import { TwoColumn } from './TwoColumn';
import { BodyRender } from './BodyRender';
import { ContributionGroup } from './ContributionGroup';
import { MarkdownBodyContribution } from './MarkdownBodyContribution';
import { useShapeDescriptor } from '../hooks/useShapeDescriptor';

export type TwoColumnBodyProps = {
  location: string;
  bodyId: string; //@aidan make sure this name/value makes sense
  rootShapeId: string
};

export function TwoColumnBody(props: TwoColumnBodyProps) {
  const x = useShapeDescriptor(props.rootShapeId, undefined);
  console.log({x})
  debugger;
  return (
    <TwoColumn
      style={{ marginTop: 50 }}
      left={
        <>
          <div style={{ paddingBottom: 15 }}>
            <Typography variant="h6">{props.location}</Typography>
            <MarkdownBodyContribution
              id={props.bodyId}
              contributionKey={'description'}
              defaultText={'Add a description'}
            />
          </div>
          <ContributionGroup rootShape={x} />
        </>
      }
      right={
        <BodyRender
          //@aidan make sure to grab this from the query result
          location="application/json"
          shape={x}
          style={{ marginTop: 35 }}
        />
      }
    />
  );
}

///delete me
const tempExample: IShapeRenderer = {
  value: undefined,
  shapeId: makeid(6),
  jsonType: JsonLike.OBJECT,
  asObject: {
    fields: [
      {
        name: 'street',
        fieldId: makeid(6),
        description: 'this is the street where it happens',
        required: true,
        changelog: {
          added: true,
        },
        shapeChoices: [
          {
            shapeId: makeid(6),
            value: '10 Waterway CT',
            jsonType: JsonLike.STRING,
          },
        ],
      },
      {
        name: 'zip_code',
        fieldId: makeid(6),
        description: '',
        required: true,
        changelog: {
          removed: true,
        },
        shapeChoices: [
          {
            shapeId: makeid(6),
            value: 267005,
            jsonType: JsonLike.NUMBER,
          },
        ],
      },
      {
        name: 'country_code',
        fieldId: makeid(6),
        description: 'two digit country code. see format x',
        required: true,
        shapeChoices: [
          {
            shapeId: makeid(6),
            value: undefined,
            jsonType: JsonLike.NULL,
          },
        ],
      },
      {
        name: 'returnable',
        fieldId: makeid(6),
        description: '',
        required: true,
        shapeChoices: [
          {
            shapeId: makeid(6),
            value: true,
            jsonType: JsonLike.OBJECT,
            asObject: {
              fields: [
                {
                  name: 'by_date',
                  fieldId: makeid(6),
                  description: 'can it be returned by a date',
                  required: true,
                  shapeChoices: [
                    {
                      shapeId: makeid(6),
                      value: '9/10/11',
                      jsonType: JsonLike.STRING,
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        name: 'note',
        fieldId: makeid(6),
        description: '',
        required: false,
        shapeChoices: [
          {
            shapeId: makeid(6),
            value:
              "Hallmark is great. Genuine understanding and very professional caring when ordering the sympathy cards from Hallmark. Thank you for your prompt response and delivery of the cards. \n\n\nNeedless to say i'm very thankful for the way i was treated.",
            jsonType: JsonLike.STRING,
          },
        ],
      },
    ],
  },
};

function makeid(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

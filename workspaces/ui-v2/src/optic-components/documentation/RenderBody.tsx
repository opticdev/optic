import * as React from 'react'; import { useEffect, useRef, useState } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { Paper, Typography } from '@material-ui/core';
import { IShapeRenderer, JsonLike } from '../shapes/ShapeRenderInterfaces';
import { RenderRootShape, ShapeRowBase } from '../shapes/ShapeRowBase';
import { ShapeRenderStore } from '../shapes/ShapeRenderContext';
import { ChoiceTabs } from '../shapes/OneOfTabs';
import { TwoColumn } from './TwoColumn';
import { BodyRender } from './BodyRender';
import { ContributionGroup } from './ContributionGroup';
import { MarkdownBodyContribution } from './MarkdownBodyContribution';

export type TwoColumnBodyProps = {
  location: string;
  bodyId: string;
};

export function TwoColumnBody(props: TwoColumnBodyProps) {
  const classes = useStyles();

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
          <ContributionGroup rootShape={[tempExample]} />
        </>
      }
      right={<BodyRender location="application/json" shape={tempExample} />}
    />
  );
}

const useStyles = makeStyles((theme) => ({}));

///delete me
const tempExample: IShapeRenderer = {
  value: undefined,
  shapeId: makeid(6),
  jsonType: JsonLike.OBJECT,
  asObject: {
    fields: [
      {
        fieldKey: 'street',
        fieldId: makeid(6),
        description: 'this is the street where it happens',
        required: true,
        changelog: {
          added: true,
        },
        shapeRenderers: [
          {
            shapeId: makeid(6),
            value: '10 Waterway CT',
            jsonType: JsonLike.STRING,
          },
        ],
      },
      {
        fieldKey: 'zip_code',
        fieldId: makeid(6),
        description: '',
        required: true,
        changelog: {
          removed: true,
        },
        shapeRenderers: [
          {
            shapeId: makeid(6),
            value: 267005,
            jsonType: JsonLike.NUMBER,
          },
        ],
      },
      {
        fieldKey: 'country_code',
        fieldId: makeid(6),
        description: 'two digit country code. see format x',
        required: true,
        shapeRenderers: [
          {
            shapeId: makeid(6),
            value: undefined,
            jsonType: JsonLike.NULL,
          },
        ],
      },
      {
        fieldKey: 'returnable',
        fieldId: makeid(6),
        description: '',
        required: true,
        shapeRenderers: [
          {
            shapeId: makeid(6),
            value: true,
            jsonType: JsonLike.OBJECT,
            asObject: {
              fields: [
                {
                  fieldKey: 'by_date',
                  fieldId: makeid(6),
                  description: 'can it be returned by a date',
                  required: true,
                  shapeRenderers: [
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
        fieldKey: 'note',
        fieldId: makeid(6),
        description: '',
        required: false,
        shapeRenderers: [
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

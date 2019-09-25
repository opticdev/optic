import React from 'react';

const ShapeRendererWrapper = withRfcContext(function (props) {
    const { shapeId, queries, bindings = {} } = props;
    const shape = queries.shapeById(shapeId);
    const { coreShapeId } = shape;
    const mapping = {
        $any: AnyShapeRenderer,
        $string: PrimitiveShapeRenderer,
        $number: PrimitiveShapeRenderer,
        $boolean: PrimitiveShapeRenderer,
        $oneOf: OneOfShapeRenderer,
        $nullable: NullableShapeRenderer,
        $optional: OptionalShapeRenderer,
        $object: ObjectShapeRenderer,
        $identifier: IdentifierShapeRenderer,
        $reference: ReferenceShapeRenderer,
    }
    const Component = mapping[coreShapeId] || AnyShapeRenderer
    return <Component {...props} bindings={{ ...bindings, ...shape.bindings }} />
})

const AnyShapeRenderer = withRfcContext(function () {
    return (
        <div>anything</div>
    )
})

const ObjectShapeRenderer = withRfcContext(function (props) {
    const { shapeId, queries } = props;

    return (
        <div>Object:</div>
    )
})

const ObjectFieldRenderer = withRfcContext(function () {
    return (
        <div>field</div>
    )
})

const OneOfShapeRenderer = withRfcContext(function () {

    return (
        <div>One of:</div>
    )
})

const PrimitiveShapeRenderer = withRfcContext(function () {

    return (
        <div>primitive</div>
    )
})

const ListShapeRenderer = withRfcContext(function () {

    return (
        <div>List of </div>
    )
})

const OptionalShapeRenderer = withRfcContext(function () {

    return (
        <div>(optional)</div>
    )
})

const NullableShapeRenderer = withRfcContext(function () {

    return (
        <div> or null</div>
    )
})

const IdentifierShapeRenderer = withRfcContext(function () {
    return (
        <div>id as </div>
    )
})
const ReferenceShapeRenderer = withRfcContext(function () {
    return (
        <div>id of </div>
    )
})


export {
    ShapeRendererWrapper,
    AnyShapeRenderer,
    ObjectShapeRenderer,
    OneOfShapeRenderer,
    PrimitiveShapeRenderer,
    ListShapeRenderer,
    OptionalShapeRenderer,
    ObjectFieldRenderer,
    NullableShapeRenderer,
    IdentifierShapeRenderer,
    ReferenceShapeRenderer,
}
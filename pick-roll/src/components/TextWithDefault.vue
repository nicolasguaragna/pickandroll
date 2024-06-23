<script>
export default {
    name: 'TextWithDefault',
    props: {
        defaultValue: {
            type: String,
            default: 'Sin especificar'
        },
        value: {
            required: true,
        }
    }   
}
</script>

<template>
    <template v-if="value">{{ value }}</template>
    <i v-else>{{ defaultValue }}</i>
</template>
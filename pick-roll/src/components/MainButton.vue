<script>
    export default{
        name: 'MainButton',
    }

</script>

<template>
    <button
        type="submit" 
        class="transition-all w-full px-4 py-2 rounded bg-customOrange hover:bg-orange-400 disabled:bg-blue-300 text-white"
        :disabled="loading"
    >
        <slot />
    </button>
</template>

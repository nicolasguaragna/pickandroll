<script>
    export default{
        name: 'BackToTop',
        data() {
    return {
      isVisible: false
    };
  },
  methods: {
    handleScroll() {
      this.isVisible = window.scrollY > 200;
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  },
  created() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>

<template>
    <button
      v-show="isVisible"
      @click="scrollToTop"
      class="fixed bottom-10 right-6 bg-customOrange text-white p-4 rounded-full shadow-lg hover:bg-customGray focus:outline-none"
    >
      ↑
    </button>
  </template>

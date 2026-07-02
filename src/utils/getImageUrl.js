
const allImages = import.meta.glob('../assets/images/**/*.{png,jpg,jpeg,svg,webp}', { eager: true });

export const getImageUrl = (url) => {
  if (!url) return null;

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  const fileName = url.split('/').pop();

  const entry = Object.entries(allImages).find(([path]) => path.endsWith('/' + fileName));

  return entry ? entry[1].default : url;
};

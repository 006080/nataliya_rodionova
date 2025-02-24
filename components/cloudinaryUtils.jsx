import { Cloudinary } from "@cloudinary/url-gen";

const cld = new Cloudinary({
  cloud: {
    cloudName: "dwenvtwyx", // Replace with your Cloudinary Cloud Name
  },
});

export const getCloudinaryImageUrl = (publicId) => {
  return cld.image(publicId).toURL(); // Generate the URL dynamically
};

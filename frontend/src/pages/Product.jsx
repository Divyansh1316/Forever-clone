import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext.js";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, backendUrl, token, favoriteItems, toggleFavorite, navigate } = useContext(ShopContext);
  const [selectedImage, setSelectedImage] = useState("");
  const [size, setSize] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const descriptionTabRef = useRef(null);
  const reviewsTabRef = useRef(null);
  const productData = products.find((item) => item._id === productId);

  const handleTabKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextTab = activeTab === "description" ? "reviews" : "description";
    setActiveTab(nextTab);
    (nextTab === "description" ? descriptionTabRef : reviewsTabRef).current?.focus();
  };

  useEffect(() => {
    let active = true;
    axios.get(`${backendUrl}/api/product/${productId}/reviews`).then(({ data }) => {
      if (active && data.success) {
        setReviews(data.reviews);
        setReviewCount(data.reviewCount);
        setAverageRating(data.averageRating);
      }
    }).catch(() => {});
    return () => { active = false; };
  }, [backendUrl, productId]);

  const submitReview = async (event) => {
    event.preventDefault();
    if (!token) { toast.info("Sign in to write a review"); navigate("/login"); return; }
    try {
      const { data } = await axios.post(`${backendUrl}/api/product/${productId}/reviews`, { rating, comment }, { headers: { token } });
      if (!data.success) throw new Error(data.message);
      setComment("");
      const latest = await axios.get(`${backendUrl}/api/product/${productId}/reviews`);
      if (latest.data.success) {
        setReviews(latest.data.reviews);
        setReviewCount(latest.data.reviewCount);
        setAverageRating(latest.data.averageRating);
      }
      toast.success("Review saved");
    } catch (error) {
      toast.error(error.response?.status === 404
        ? "Reviews require the latest backend deployment."
        : error.response?.data?.message || "Unable to save review");
    }
  };

  if (!productData) return <div className="min-h-[50vh]" aria-label="Loading product" />;
  const image = productData.image.includes(selectedImage) ? selectedImage : productData.image[0];
  const isFavorite = favoriteItems.includes(productData._id);

  return <div className="border-t border-zinc-200 pt-10 dark:border-zinc-700">
    <div className="flex gap-12 flex-col sm:flex-row">
      <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
        <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-auto gap-2 sm:w-[18.7%] w-full">
          {productData.image.map((item, index) => <button key={`${item}-${index}`} onClick={() => setSelectedImage(item)} aria-label={`View product image ${index + 1}`}><img src={item} className="w-20 sm:w-full" alt={`${productData.name} view ${index + 1}`} loading="lazy" /></button>)}
        </div>
        <div className="w-full sm:w-[80%]"><img className="w-full h-auto" src={image} alt={productData.name} /></div>
      </div>
      <div className="flex-1">
        <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{reviewCount ? `${averageRating.toFixed(1)} / 5 - ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}` : "No reviews yet"}</p>
        <p className="mt-5 text-3xl font-medium">{currency}{productData.price}</p>
        <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>
        <div className="flex flex-col gap-4 my-8"><p>Select Size</p><div className="flex gap-2">{productData.sizes.map((item) => <button type="button" aria-pressed={item === size} onClick={() => setSize(item)} className={`size-option rounded-sm border py-2 px-4 ${item === size ? "size-option-selected border-rose-500 bg-rose-50 text-rose-900" : "bg-gray-100 dark:bg-zinc-700"}`} key={item}>{item}</button>)}</div></div>
        <button onClick={() => addToCart(productData._id, size)} className="bg-black px-8 py-3 text-sm text-white active:bg-gray-700 dark:bg-zinc-100 dark:text-zinc-900">ADD TO CART</button>
        <button type="button" onClick={() => toggleFavorite(productData._id)} className="ml-3 border px-5 py-3 text-sm dark:border-[#18181b]" aria-pressed={isFavorite}>{isFavorite ? "Saved to favorites" : "Add to favorites"}</button>
        <hr className="mt-8 sm:w-4/5" />
        <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1"><p>Selected for quality and everyday wear.</p><p>Choose your size before adding this item to your cart.</p></div>
      </div>
    </div>
    <section className="mt-20">
      <div className="flex" role="tablist" aria-label="Product information">
        <button
          id="description-tab"
          ref={descriptionTabRef}
          type="button"
          role="tab"
          tabIndex={activeTab === "description" ? 0 : -1}
          aria-selected={activeTab === "description"}
          aria-controls="description-panel"
          onClick={() => setActiveTab("description")}
          onKeyDown={handleTabKeyDown}
          className={`border px-5 py-3 text-sm ${activeTab === "description" ? "font-semibold" : "text-gray-500 dark:text-gray-400"}`}
        >Description</button>
        <button
          id="reviews-tab"
          ref={reviewsTabRef}
          type="button"
          role="tab"
          tabIndex={activeTab === "reviews" ? 0 : -1}
          aria-selected={activeTab === "reviews"}
          aria-controls="reviews-panel"
          onClick={() => setActiveTab("reviews")}
          onKeyDown={handleTabKeyDown}
          className={`border px-5 py-3 text-sm ${activeTab === "reviews" ? "font-semibold" : "text-gray-500 dark:text-gray-400"}`}
        >Reviews ({reviewCount})</button>
      </div>
      {activeTab === "description" ? (
        <div id="description-panel" role="tabpanel" tabIndex={0} aria-labelledby="description-tab" className="border px-6 py-6 text-sm text-gray-600 dark:text-gray-300">
          <p>{productData.description}</p>
        </div>
      ) : (
        <div id="reviews-panel" role="tabpanel" tabIndex={0} aria-labelledby="reviews-tab" className="space-y-6 border px-6 py-6 text-sm text-gray-600 dark:text-gray-300">
          <div><h2 className="mb-3 text-base font-medium">Customer reviews</h2>
            {reviews.length ? <ul className="space-y-4">{reviews.map((review) => <li key={review._id} className="border-b pb-3"><p className="font-medium">{review.userName} - {review.rating}/5</p><p className="mt-1">{review.comment}</p><p className="mt-1 text-xs">{new Date(review.createdAt).toLocaleDateString()}</p></li>)}</ul> : <p>No reviews yet. Share your experience with this product.</p>}
          </div>
          <form onSubmit={submitReview} className="max-w-xl space-y-3">
            <label className="block" htmlFor="review-rating">Your rating</label>
            <select id="review-rating" value={rating} onChange={(event) => setRating(Number(event.target.value))} className="border bg-white p-2 dark:bg-zinc-800">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select>
            <label className="block" htmlFor="review-comment">Your review</label>
            <textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} required maxLength={1000} rows={4} className="block w-full border bg-white p-2 dark:bg-zinc-800" />
            <button className="bg-black px-5 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900" type="submit">Submit review</button>
          </form>
        </div>
      )}
    </section>
    <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
  </div>;
};

export default Product;

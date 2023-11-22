import CreatePost from "@/components/CreatePost";
import GeneratePosts from "@/components/GeneratePosts";

export default function Home() {
    return (
        <>
            <CreatePost />
            <hr className="border-2 border-linePrimary rounded-posts mt-8"></hr>
        </>
    );
}

import CreatePost from "@/components/CreatePost";
import GeneratePosts from "@/components/GeneratePosts";
import BackendContent from "@/components/backendContent";

export default function Home() {
    return (
        <>
            <CreatePost />
            <hr className="border-2 border-linePrimary rounded-posts mt-8"></hr>
            <GeneratePosts />
            <GeneratePosts />
            <GeneratePosts />

            <BackendContent />
        </>
    );
}

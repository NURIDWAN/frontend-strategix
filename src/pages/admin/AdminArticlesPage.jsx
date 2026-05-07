import { useNavigate } from "react-router-dom";
import ArticleList from "../../components/Admin/Article/ArticleList";

const AdminArticlesPage = () => {
  const navigate = useNavigate();

  const handleNavigateToForm = (articleId) => {
    if (articleId) {
      navigate(`/admin/articles/${articleId}/edit`);
    } else {
      navigate("/admin/articles/create");
    }
  };

  return <ArticleList onNavigateToForm={handleNavigateToForm} />;
};

export default AdminArticlesPage;

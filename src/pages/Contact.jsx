import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Contact() {

return(

<>

<Navbar/>

<div className="page">

<h1>اتصل بنا</h1>

<form className="contact-form">

<input
type="text"
placeholder="الاسم"/>

<input
type="email"
placeholder="البريد الإلكتروني"/>

<textarea
placeholder="اكتب رسالتك"></textarea>

<button>

إرسال

</button>

</form>

</div>

<Footer/>

</>

)

}

export default Contact;
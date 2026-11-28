import { useEffect, useState } from "react";
import styles from "../styles/Coastal.module.css";
import { experiences } from "./ExperienceCards";

const options = ["Private entertaining and tablescape design",...experiences.map(item=>item.title),"Intimate celebrations","Other"];
export default function VeroInquiry() {
  const [service,setService]=useState(options[0]);
  const [status,setStatus]=useState("idle");
  useEffect(()=>{
    const value=new URLSearchParams(window.location.search).get("experience");
    if(options.includes(value))setService(value);
  },[]);
  async function submit(event){
    event.preventDefault();
    const form=event.currentTarget;
    const data=Object.fromEntries(new FormData(form));
    if(data.website){setStatus("success");return;}
    const key=process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
    if(!key){setStatus("error");return;}
    setStatus("sending");
    const query=new URLSearchParams(window.location.search);
    const campaign={};for(const field of ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"]){const value=query.get(field);if(value)campaign[field]=value.slice(0,250);}
    const fields={name:data.name,email:data.email,phone:data.phone,location:data.location,event_date:data.event_date,guest_count:data.guest_count,event_type:data.event_type,estimated_budget:data.estimated_budget,services:data.services,event_notes:data.event_notes,landing_page:"/vero-beach",...campaign};
    try{
      const response=await fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({access_key:key,subject:"New Maison Lucia Vero Beach Inquiry",from_name:"Maison Lucia Website",replyto:data.email,...fields,message:Object.entries(fields).map(([k,v])=>k.replaceAll("_"," ")+": "+(v||"Not specified")).join("\n"),botcheck:""})});
      const result=await response.json();
      if(!response.ok||!result.success)throw Error("Inquiry delivery failed");
      form.reset();setService(options[0]);setStatus("success");
    }catch{setStatus("error");}
  }
  return <section id="vero-inquiry" className={styles.veroInquiry} aria-labelledby="vero-inquiry-title">
    <div><p className={styles.eyebrow}>Your gathering, thoughtfully considered</p><h2 id="vero-inquiry-title">Let us bring your table to life.</h2><p>Tell us a little about your private dinner, celebration or tablescape. We look forward to creating something personal and beautiful with you.</p><a href="/event-questionnaire" className={styles.textLink}>Prefer a detailed event questionnaire?</a></div>
    <form onSubmit={submit} className={styles.veroForm}>
      <div className={styles.formGrid}>
        <label>Your name *<input name="name" required autoComplete="name" maxLength={150}/></label>
        <label>Email *<input name="email" type="email" required autoComplete="email" maxLength={250}/></label>
        <label>Phone<input name="phone" type="tel" autoComplete="tel" maxLength={50}/></label>
        <label>Event location<input name="location" placeholder="City or venue" maxLength={250}/></label>
        <label>Event date<input name="event_date" type="date"/></label>
        <label>Estimated guests<input name="guest_count" type="number" min="1" max="100000" step="1"/></label>
        <label>Event type<input name="event_type" placeholder="Private dinner, celebration…" maxLength={150}/></label>
        <label>Estimated budget<input name="estimated_budget" placeholder="Your preferred range" maxLength={150}/></label>
      </div>
      <label>Interested in<select name="services" value={service} onChange={event=>setService(event.target.value)}>{options.map(option=><option key={option}>{option}</option>)}</select></label>
      <label>Tell us about your gathering<textarea name="event_notes" rows="4" maxLength={3000}/></label>
      <div className={styles.srOnly} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
      <button type="submit" className={styles.veroButton} disabled={status==="sending"}>{status==="sending"?"Sending…":"Send an inquiry"}</button>
      {status==="success"&&<p role="status">Thank you. Your inquiry has been sent to Maison Lucia.</p>}
      {status==="error"&&<p role="alert">Your inquiry could not be sent. Please try again or use our <a href="/event-questionnaire">event questionnaire</a>.</p>}
    </form>
  </section>;
}

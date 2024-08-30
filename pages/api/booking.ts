import type { NextApiRequest, NextApiResponse } from "next";
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_KEY);
type Data = {
  message: string;
};
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === "POST") {
    //Send email to admin
    let data = JSON.parse(req.body)
    let msg = `Name: ${data.name}\r\n 
    Email: ${data.email}\r\n 
    Phone: ${data.phone}\r\n 
    Message: ${data.message}`;
    let emailToAdmin = {
      to: "admin@jmountvagamon.in",
      from: "system@jmountvagamon.in",
      subject: `${data.name} sent you a message from Contact Form`,
      html: msg.replace(/\r\n/g, "<br>"),
    };
    let emailToCustomer = {
      to: data.email,
      from: "system@jmountvagamon.in",
      subject: `${data.name} sent you a message from Contact Form`,
      html: msg.replace(/\r\n/g, "<br>"),
    };
    try {
      //await sgMail.send(emailToAdmin);
      console.log(JSON.parse(req.body), JSON.parse(req.body)["email"]);
      await sgMail.send(emailToCustomer);

      res.status(200).json({ message: "Your message was sent successfully to customer" });
    } catch (err) {
      console.log(err);
      
      res.status(200).json({ message: JSON.stringify(err) });
    }

    
  }

}

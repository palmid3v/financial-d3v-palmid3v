const API_BASE=import.meta.env.VITE_API_BASE_URL||"http://localhost:8080";
export async function api(path,{token,ownerId,method="GET",body}={}) {
  const headers={"Content-Type":"application/json"};
  if(token) headers.Authorization=`Bearer ${token}`;
  else if(ownerId) headers["X-Owner-ID"]=ownerId;
  const response=await fetch(`${API_BASE}${path}`,{method,headers,body:body?JSON.stringify(body):undefined});
  const text=await response.text();
  const data=text?JSON.parse(text):null;
  if(!response.ok) throw new Error(data?.error||`Request failed: ${response.status}`);
  return data;
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const GioiThieuManager = ({ data, updateSiteData }) => {
  const [title, setTitle] = useState(data.intro.title);
  const [content, setContent] = useState(data.intro.content);

  const handleSubmit = async (event) => {
    event.preventDefault();

    await updateSiteData((prev) => ({
      ...prev,
      intro: {
        ...prev.intro,
        title,
        content,
      },
    }));
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Giới thiệu</CardTitle>
        <CardDescription>Chỉnh sửa tiêu đề và nội dung phần Giới thiệu.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium">intro.title</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">intro.content</label>
            <Textarea className="min-h-36 rounded-none" value={content} onChange={(event) => setContent(event.target.value)} />
          </div>
          <Button type="submit">Lưu Giới thiệu</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GioiThieuManager;

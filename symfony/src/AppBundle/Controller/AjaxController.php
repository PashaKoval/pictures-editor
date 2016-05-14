<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Comments;
use AppBundle\Entity\Image;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class AjaxController extends Controller
{
    /**
     * @Route("/ajax-image-upload", name="image_upload")
     * @Method("POST")
     */
    public function imageUploadAction()
    {
        $em = $this->get('doctrine.orm.default_entity_manager');
        $user = $em->getRepository('AppBundle:User')->find($this->getUser()->getId());
        $image_ = new Image();

        $imgname = substr(md5(microtime(true)), 0, 6);
        $dir = $this->getParameter('kernel.root_dir')."/../web/storage/".substr($imgname,0,2);
        @mkdir("$dir", 0777, true);
        $upload = "$dir/$imgname";

        while (file_exists($upload))
        {
            $imgname .= rand(1, 9);
            $upload = "$dir/$imgname";
        }

        $upload .= '.jpg';
        $bs64 = @end(explode('base64,', $_POST['file']));

        if(isset($_POST['dragAndDrop'])){
            if(is_array($_FILES)) {
                if(is_uploaded_file($_FILES['userImage']['tmp_name'])) {
                    $sourcePath = $_FILES['userImage']['tmp_name'];
                    $targetPath = $upload;
                    if(move_uploaded_file($sourcePath,$targetPath) && $this->checkMimeType($_FILES['userImage']['type'])) {
                        $host = str_replace('www.', '', $_SERVER['HTTP_HOST']);
                        if(empty($_SESSION['myimages'])) $_SESSION['myimages'] = array();
                        $_SESSION['myimages'][] = $imgname;

                        $image_->setDateCreate(new \DateTime('now'))
                            ->setPath($imgname)
                            ->setUser($user);
                        $em->persist($image_);
                        $em->flush();

                        return new Response("http://$host/edit/".end($_SESSION['myimages']));
                    }else{
                        return new Response('error');
                    }
                }else{
                    return new Response('error');
                }
            }else{
                return new Response('error');
            }

        }elseif(isset($_POST['url'])){
            $url = $_POST['url'];
            preg_match('/^(https?:\/\/)?([\w\.]+)\.([a-z]{2,6}\.?)(\/[\w\.-]*)*(jpeg|jpg|png|bmp|JPEG|JPG|PNG|BMP)\/?$/', $url, $matches);

            if(!empty($matches[0])){
                $ReadFile = fopen ($url, "rb");
                if ($ReadFile) {
                    $WriteFile = fopen ($upload, "wb");
                    if ($WriteFile){
                        while(!feof($ReadFile)) {
                            fwrite($WriteFile, fread($ReadFile, 6291456 ));
                        }
                        fclose($WriteFile);
                        $host = str_replace('www.','',$_SERVER['HTTP_HOST']);
                        if(empty($_SESSION['myimages'])) $_SESSION['myimages'] = array();
                        $_SESSION['myimages'][] = $imgname;

                        $image_->setDateCreate(new \DateTime('now'))
                            ->setPath($imgname)
                            ->setUser($user);
                        $em->persist($image_);
                        $em->flush();

                        return new Response("http://$host/edit/".end($_SESSION['myimages']));
                    }
                    fclose($ReadFile);
                }else{
                    return new Response('error');
                }
            }else{
                return new Response('error');
            }

        }
        else{
            $image = imagecreatefromstring(base64_decode($bs64));
            if (!imagejpeg($image, $upload, 80))
            {
                return new Response('error');
            }else{
                $host = str_replace('www.','',$_SERVER['HTTP_HOST']);
                if(empty($_SESSION['myimages'])) $_SESSION['myimages'] = array();
                $_SESSION['myimages'][] = $imgname;

                $image_->setDateCreate(new \DateTime('now'))
                    ->setPath($imgname)
                    ->setUser($user);
                $em->persist($image_);
                $em->flush();

                return new Response("http://$host/edit/".end($_SESSION['myimages']));
            }
        }
    }

    /**
     * @Route("/ajax-image-save", name="image_save")
     * @Method("POST")
     */
    public function saveChanges()
    {
        if(!empty($_POST['name']) && !empty($_POST['dataUrl'])){
            $name = $this->getParameter('kernel.root_dir')."/../web".$_POST['name'];

            $bs64 = @end(str_replace(' ','+', explode('base64,', $_POST['dataUrl'])));
            $image = imagecreatefromstring(base64_decode($bs64));

            if (!imagejpeg($image, $name, 80))
            {
                return new Response('error');
            }

            return new Response('success');
        }

        return new Response('fail');
    }


    /**
     * @Route("/ajax-comment-add", name="add_comment")
     * @Method("POST")
     */
    public function addComment(Request $request)
    {
        try{
            $em = $this->get('doctrine.orm.default_entity_manager');
            $text = $request->request->get('text');
            $image = $request->request->get('image');
            $user = $em->getRepository('AppBundle:User')
                ->find($this->getUser()->getId());
            $image = $em->getRepository('AppBundle:Image')
                ->getByPath($image);

            $comments = new Comments();
            $comments->setDateCreate(new \DateTime('now'))
                ->setText($text)
                ->setImage($image)
                ->setUser($user);

            $em->persist($comments);
            $em->flush();

            return new Response('success');

        } catch (\Exception $e) {
            return new Response('error');
        }
    }

    private function checkMimeType($type){
        $allowTypes = array('image/bmp', 'image/jpeg', 'image/png');
        if(in_array($type, $allowTypes))
            return true;
        return false;
    }
}


<?php

namespace AppBundle\Controller;

use AppBundle\Form\CommentType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Predis\Client;

class IndexController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function indexAction()
    {
        return $this->redirectToRoute('upload');
    }

    /**
     * @Route("/edit/{image}", name="edit")
     */
    public function editAction(Request $request, $image)
    {
        $host = $request->getHost();
        $imagePath = '/storage/'.substr($image,0,2).'/'.$image.'.jpg';
        $comments = $this->get('doctrine.orm.default_entity_manager')
            ->getRepository('AppBundle:Comments')->getByImage($image);

//         Uncomment this to publish to redis and use Ratchet or Faye
        $data = [
          'event' => 'new-message',
          'data' => 'hello!'
        ];

        $jsonContent = json_encode($data);
        $redis = new Client('tcp://127.0.0.1:6379');
        $redis->publish('chat', $jsonContent);

        return $this->render('AppBundle:Index:edit.html.twig',[
            'url_image' => $host.'/edit/'.$image,
            'image' => $imagePath,
            'image_name' => $image,
            'comments' => $comments
        ]);
    }

    /**
     * @Route("/history", name="history")
     */
    public function historyAction()
    {
        $em = $this->get('doctrine.orm.default_entity_manager');
        $images = $em->getRepository('AppBundle:Image')
            ->getImagesByUser($this->getUser()->getId());

        return $this->render('@App/Index/history.html.twig', [
            'images' => $images
        ]);
    }

    /**
     * @Route("/about", name="about")
     */
    public function aboutAction()
    {

    }

    /**
     * @Route("/faq", name="faq")
     */
    public function faqAction()
    {

    }

    /**
     * @Route("/rules", name="rules")
     */
    public function rulesAction()
    {

    }

    /**
     * @Route("/upload", name="upload")
     */
    public function uploadAction()
    {
        return $this->render('@App/Index/upload.html.twig');
    }

    /**
     * @Route("/delete/{image}", name="delete")
     */
    public function deleteAction($image)
    {
        $em = $this->get('doctrine.orm.default_entity_manager');
        $em->getRepository('AppBundle:Image')->deleteByPath($image);

        $imagePath = $this->getParameter('kernel.root_dir')."/../web/storage/".substr($image,0,2).'/'.$image.'.jpg';
        unlink($imagePath);
        return $this->redirectToRoute('history');
    }
}
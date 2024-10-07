using UnityEngine;
public class Player : MonoBehaviour
{
    private Vector2 startTouchPosition;
    private Vector2 currentTouchPosition;
    private float direction;
    public Camera camera;
    public bool canMove;

    void Update()
    {
        if (!canMove) return;
        if (Input.touchCount > 0)
        {
            Touch touch = Input.GetTouch(0);

            if (touch.phase == TouchPhase.Began)
            {
                startTouchPosition = touch.position;
            }
            else if (touch.phase == TouchPhase.Moved)
            {
                currentTouchPosition = touch.position;

                if (Mathf.Abs(currentTouchPosition.x - startTouchPosition.x) > 1)
                {
                    direction = Mathf.Sign(currentTouchPosition.x - startTouchPosition.x);
                }
            }
            if (direction != 0)
            {
                transform.Translate(direction * 0.025f, 0, 0);
                transform.localScale = new Vector3(direction * 0.5f, 0.5f, 1);
            }
        }
        else
        {
            direction = 0;
        }
        camera.transform.position = new Vector3(transform.position.x + 6, 1, -10);
    }
}